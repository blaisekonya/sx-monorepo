<script setup lang="ts">
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { LocationQueryValue } from 'vue-router';
import { registerTransaction } from '@/helpers/mana';
import { getChoiceText, getFormattedVotingPower } from '@/helpers/utils';
import { getValidator } from '@/helpers/validation';
import { getNetwork, offchainNetworks } from '@/networks';
import { Choice, NetworkID, Proposal } from '@/types';
import { Connector } from '@/networks/types';

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
const auth = getInstance();

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
