<script setup lang="ts">
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { LocationQueryValue } from 'vue-router';
import { getChoiceText, getFormattedVotingPower } from '@/helpers/utils';
import { getValidator } from '@/helpers/validation';
import { getNetwork, offchainNetworks } from '@/networks';
import { Choice, NetworkID, Proposal } from '@/types';
import { Connector } from '@/networks/types';

declare global {
  interface Window {
    ethereum?: any;
  }
}

import { Web3Provider } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { constants } from 'starknet';
import { formatAddress } from '@/helpers/utils';
import { STARKNET_CONNECTORS } from '@/networks/common/constants';

const STARKNET_NETWORKS = {
  [constants.StarknetChainId.SN_MAIN]: {
    key: constants.StarknetChainId.SN_MAIN,
    chainId: constants.StarknetChainId.SN_MAIN,
    explorer: { url: 'https://starkscan.co' }
  },
  [constants.StarknetChainId.SN_SEPOLIA]: {
    key: constants.StarknetChainId.SN_SEPOLIA,
    chainId: constants.StarknetChainId.SN_SEPOLIA,
    explorer: { url: 'https://sepolia.starkscan.co' }
  }
};

Object.assign(networks, STARKNET_NETWORKS);

let auth;
const defaultNetwork: any =
  import.meta.env.VITE_DEFAULT_NETWORK || Object.keys(networks)[0];

const state = reactive({
  account: '',
  name: '',
  type: '',
  walletconnect: '',
  network: networks[defaultNetwork],
  authLoading: false
});
const authInitiated = ref(false);
const loadedProviders = ref(new Set<Connector>());

export function useWeb3() {
  async function login(connector: string | undefined | boolean = 'injected') {
    authInitiated.value = true;

    if (!connector) return;

    try {
      auth = getInstance();
      state.authLoading = true;
      await auth.login(connector);
      await registerProvider();

      // NOTE: Handle case where metamask stays locked after user ignored
      // the unlock request on subsequent page loads
      if (
        state.type !== 'injected' ||
        auth.provider?.value?._state?.isUnlocked
      ) {
        state.authLoading = false;
      }
    } finally {
      state.authLoading = false;
    }
  }

  async function autoLogin(preferredConnector?: string) {
    auth = getInstance();
    const connector: boolean | string =
      preferredConnector || (await auth.getConnector());

    authInitiated.value = true;

    if (!connector) return;

    state.authLoading = true;
    try {
      await auth.autoLogin(connector as string);
      await registerProvider();
    } finally {
      state.authLoading = false;
    }
  }

  function logout() {
    auth = getInstance();
    removeProviderEvents(auth.provider.value);
    auth.logout();
    state.account = '';
    state.name = '';
    state.type = '';
    state.walletconnect = '';
  }

  async function registerProvider() {
    if (!auth.provider.value) return;

    auth.web3 = new Web3Provider(auth.provider.value, 'any');
    await loadProvider(auth.provider.value);
  }

  async function loadProvider(provider) {
    if (!provider) return;

    const connector = provider.connectorName;

    try {
      attachProviderEvents(provider);
      let network, accounts;
      try {
        if (connector === 'gnosis') {
          const { chainId: safeChainId, safeAddress } = auth.web3.provider.safe;
          network = { chainId: safeChainId };
          accounts = [safeAddress];
        } else if (STARKNET_CONNECTORS.includes(connector)) {
          network = {
            chainId:
              provider.chainId ||
              provider.provider.chainId ||
              provider.provider.provider.chainId
          };
          accounts = [provider.selectedAddress];
        } else {
          [network, accounts] = await Promise.all([
            auth.web3.getNetwork(),
            auth.web3.listAccounts()
          ]);
        }
      } catch (e) {
        console.log(e);
      }
      handleChainChanged(network.chainId);
      const acc = accounts.length > 0 ? accounts[0] : null;

      if (acc) {
        const usersStore = useUsersStore();
        try {
          await usersStore.fetchUser(formatAddress(acc));
        } catch (e) {
          console.warn('failed to fetch user', e);
        }
        state.account = formatAddress(acc);
        state.name = usersStore.getUser(acc)?.name || '';
      }

      // NOTE: metamask doesn't return connectorName
      state.type = connector ?? 'injected';
      state.walletconnect = auth.provider.value?.wc?.peerMeta?.name || '';
    } catch (e) {
      state.account = '';
      state.name = '';
      state.type = '';
      return Promise.reject(e);
    }
  }

  function handleChainChanged(chainId) {
    if (!networks[chainId]) {
      networks[chainId] = {
        ...networks[defaultNetwork],
        chainId,
        name: 'Unknown',
        unknown: true
      };
    }
    state.network = networks[chainId];

    const connector = auth.provider.value?.connectorName;
    if (typeof connector === 'undefined') {
      // NOTE: metamask doesn't return connectorName
      state.type = 'injected';
    }
  }

  function attachProviderEvents(provider) {
    const providerName: Connector = provider?.connectorName || 'injected';

    if (loadedProviders.value.has(providerName)) return;
    loadedProviders.value.add(providerName);

    if (!provider.on) return;

    provider.on('accountsChanged', async accounts => {
      if (!accounts?.length) {
        logout();
        return;
      }

      state.account = formatAddress(accounts[0]);
      await login(providerName);
    });

    if (!STARKNET_CONNECTORS.includes(providerName)) {
      provider.on('chainChanged', async chainId => {
        handleChainChanged(parseInt(formatUnits(chainId, 0)));
      });
    }

    // auth.provider.on('disconnect', async () => {});
  }

  function removeProviderEvents(provider) {
    loadedProviders.value.delete(provider?.connectorName || 'injected');

    try {
      provider.removeAllListeners();
    } catch (e: any) { }
  }

  return {
    login,
    logout,
    autoLogin,
    authInitiated,
    web3: computed(() => state),
    web3Account: computed(() => state.account)
  };
}


const REASON_DEFINITION = {
  title: 'Reason',
  type: 'string',
  format: 'long',
  examples: ['Share you reason (optional)'],
  maxLength: 5000
};

const props = defineProps<{
  proposal: Proposal;
  choice: Choice | null;
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close');
  (e: 'voted');
}>();

const uiStore = useUiStore();
const { modalAccountOpen } = useModal();
const { web3 } = useWeb3();
const { get: getVotingPower, fetch: fetchVotingPower } = useVotingPower();
const proposalsStore = useProposalsStore();
const { addPendingVote, loadVotes, votes } = useAccount();
const route = useRoute();

const loading = ref(false);
const form = ref<Record<string, string>>({ reason: '' });
const formErrors = ref({} as Record<string, any>);
const formValidated = ref(false);
const modalTransactionOpen = ref(false);
const modalShareOpen = ref(false);
const txId = ref<string | null>(null);
const selectedChoice = ref<Choice | null>(null);

const formValidator = getValidator({
  $async: true,
  type: 'object',
  title: 'Reason',
  additionalProperties: false,
  required: [],
  properties: {
    reason: REASON_DEFINITION
  }
});

const votingPower = computed(() =>
  getVotingPower(props.proposal.space, props.proposal)
);

const formattedVotingPower = computed(() =>
  getFormattedVotingPower(votingPower.value)
);

const offchainProposal = computed<boolean>(() =>
  offchainNetworks.includes(props.proposal.network)
);

const canSubmit = computed<boolean>(
  () =>
    formValidated.value &&
    !!props.choice &&
    Object.keys(formErrors.value).length === 0 &&
    !!votingPower.value?.canVote
);

const MANA_URL =
  import.meta.env.VITE_MANA_URL || 'http://localhost:3000';

async function rpcCall(path: string, method: string, params: any) {
  const res = await fetch(`${MANA_URL}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: null
    })
  });

  const { error, result } = await res.json();
  if (error) throw new Error('RPC call failed');

  return result;
}

async function registerTransaction(
  chainId: number | string,
  params: {
    type: string;
    sender: string;
    hash: string;
    payload: any;
  }
) {
  return rpcCall(`stark_rpc/${chainId}`, 'registerTransaction', params);
}

async function handleCommitEnvelope(envelope: any, networkId: NetworkID) {
  // TODO: it should work with WalletConnect, should be done before L1 transaction is broadcasted
  const network = getNetwork(networkId);

  if (envelope?.signatureData?.commitHash && network.baseNetworkId) {
    await registerTransaction(network.chainId, {
      type: envelope.signatureData.primaryType,
      sender: envelope.signatureData.address,
      hash: envelope.signatureData.commitHash,
      payload: envelope.data
    });

    if (envelope.signatureData.commitTxId) {
      uiStore.addPendingTransaction(
        envelope.signatureData.commitTxId,
        network.baseNetworkId
      );
    }

    uiStore.addNotification(
      'success',
      'Transaction set up. It will be processed once received on L2 network automatically.'
    );

    return true;
  }

  return false;
}

async function forceLogin() {
  modalAccountOpen.value = true;
}

function handleSafeEnvelope(envelope: any) {
  if (envelope !== null) return false;

  uiStore.addNotification('success', 'Transaction set up.');
  return true;
}

async function wrapPromise(
  networkId: NetworkID,
  promise: Promise<any>,
  opts: { transactionNetworkId?: NetworkID } = {}
): Promise<string | null> {
  const network = getNetwork(networkId);

  const envelope = await promise;

  if (handleSafeEnvelope(envelope)) return null;
  if (await handleCommitEnvelope(envelope, networkId)) return null;

  let hash;
  if (envelope.payloadType === 'HIGHLIGHT_VOTE') {
    console.log('Receipt', envelope.signatureData);
  } else if (envelope.signatureData || envelope.sig) {
    const receipt = await network.actions.send(envelope);
    hash = receipt.transaction_hash || receipt.hash;

    console.log('Receipt', receipt);

    if (envelope.signatureData.signature === '0x')
      uiStore.addNotification(
        'success',
        'Your vote is pending! waiting for other signers'
      );
    hash && uiStore.addPendingTransaction(hash, networkId);
  } else {
    hash = envelope.transaction_hash || envelope.hash;
    console.log('Receipt', envelope);

    uiStore.addPendingTransaction(
      hash,
      opts.transactionNetworkId || networkId
    );
  }

  return hash;
}

async function vote(
  proposal: Proposal,
  choice: Choice,
  reason: string,
  app: string
): Promise<string | null> {
  if (!web3.value.account) {
    await forceLogin();
    return null;
  }

  const network = getNetwork(proposal.network);

  const txHash = await wrapPromise(
    proposal.network,
    network.actions.vote(
      auth.web3,
      web3.value.type as Connector,
      web3.value.account,
      proposal,
      choice,
      reason,
      app
    )
  );

  addPendingVote(proposal.id);

  return txHash;
}

async function handleSubmit() {
  loading.value = true;
  selectedChoice.value = props.choice;

  if (offchainProposal.value) {
    try {
      await voteFn();
      handleConfirmed();
    } finally {
      loading.value = false;
    }
  } else {
    emit('close');
    loading.value = false;
    modalTransactionOpen.value = true;
  }
}

async function voteFn() {
  if (!selectedChoice.value) return null;

  const appName = (route.query.app as LocationQueryValue) || '';

  return vote(
    props.proposal,
    selectedChoice.value,
    form.value.reason,
    appName.length <= 128 ? appName : ''
  );
}

async function handleConfirmed(tx?: string | null) {
  if (tx) txId.value = tx;
  modalTransactionOpen.value = false;
  modalShareOpen.value = true;

  emit('voted');
  emit('close');

  loading.value = false;

  // TODO: Quick fix only for offchain proposals, need a more complete solution for onchain proposals
  if (offchainProposal.value) {
    proposalsStore.fetchProposal(
      props.proposal.space.id,
      props.proposal.id,
      props.proposal.network
    );
    await loadVotes(props.proposal.network, [props.proposal.space.id]);
  }
}

function handleFetchVotingPower() {
  fetchVotingPower(props.proposal.space, props.proposal);
}

watch(
  [() => props.open, () => web3.value.account],
  async ([open, toAccount], [, fromAccount]) => {
    if (!open) return;

    if (fromAccount && toAccount && fromAccount !== toAccount) {
      loading.value = true;
      form.value.reason = '';
      await loadVotes(props.proposal.network, [props.proposal.space.id]);
    }

    handleFetchVotingPower();

    form.value.reason =
      votes.value[`${props.proposal.network}:${props.proposal.id}`]?.reason ||
      '';

    loading.value = false;
  },
  { immediate: true }
);

watchEffect(async () => {
  formValidated.value = false;

  formErrors.value = await formValidator.validateAsync(form.value);
  formValidated.value = true;
});
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>Cast your vote</h3>
    </template>
    <div class="m-4 mb-3 flex flex-col space-y-3">
      <MessageVotingPower
        v-if="votingPower"
        :voting-power="votingPower"
        action="vote"
        @fetch-voting-power="handleFetchVotingPower"
      />
      <dl>
        <dt class="text-sm leading-5">Choice</dt>
        <dd class="text-skin-heading text-[20px] leading-6">
          <span
            v-if="choice"
            class="test-skin-heading font-semibold"
            v-text="getChoiceText(proposal.choices, choice)"
          />
          <div v-else class="flex gap-1 text-skin-danger items-center">
            <IH-exclamation-circle />
            No choice selected
          </div>
        </dd>
        <dt class="text-sm leading-5 mt-3">Voting power</dt>
        <dd v-if="!votingPower || votingPower.status === 'loading'">
          <UiLoading />
        </dd>
        <dd
          v-else-if="votingPower.status === 'success'"
          class="font-semibold text-skin-heading text-[20px] leading-6"
          v-text="formattedVotingPower"
        />
        <dd
          v-else-if="votingPower.status === 'error'"
          class="font-semibold text-skin-heading text-[20px] leading-6"
          v-text="formattedVotingPower"
        />
      </dl>
      <div v-if="!proposal.privacy" class="s-box">
        <UiForm
          v-model="form"
          :error="formErrors"
          :definition="{ properties: { reason: REASON_DEFINITION } }"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col xs:flex-row gap-3">
        <UiButton
          class="w-full order-last xs:order-none"
          @click="$emit('close')"
        >
          Cancel
        </UiButton>
        <UiButton
          primary
          class="w-full"
          :disabled="!canSubmit"
          :loading="loading"
          @click="handleSubmit"
        >
          Confirm
        </UiButton>
      </div>
    </template>
  </UiModal>

  <teleport to="#modal">
    <ModalTransactionProgress
      :open="modalTransactionOpen"
      :network-id="proposal.network"
      :messages="{
        approveTitle: 'Confirm vote'
      }"
      :execute="voteFn"
      @confirmed="handleConfirmed"
      @close="modalTransactionOpen = false"
    />
    <ModalShare
      :open="modalShareOpen"
      :tx-id="txId"
      :show-icon="true"
      :shareable="{ proposal, choice: selectedChoice! }"
      :messages="{
        title: 'Vote success!'
      }"
      @close="modalShareOpen = false"
    />
  </teleport>
</template>
