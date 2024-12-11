<script setup lang="ts">
import { ref, watch, toRaw } from 'vue';
import { ZkMeWidget, verifyMeidWithZkMeServices } from '@zkmelabs/widget';
import { Engine } from '@thirdweb-dev/engine';
import { CHAIN, GLOBAL_VOTER_ID_ZKME_ADDRESS, DRACHMA_CONTRACT_ADDRESS, REFERRAL_REWARD } from '../helpers/constants';
import { ethers } from 'ethers';
import '@zkmelabs/widget/dist/style.css'

const ZKME_API_KEY = import.meta.env.VITE_ZKME_API_KEY;

const THIRDWEB_ENGINE_URL = import.meta.env.VITE_THIRDWEB_ENGINE_URL;
const THIRDWEB_ENGINE_ACCESS_TOKEN = import.meta.env
  .VITE_THIRDWEB_ENGINE_ACCESS_TOKEN;
const THIRDWEB_BACKEND_WALLET_ADDRESS = import.meta.env
  .VITE_THIRDWEB_BACKEND_WALLET_ADDRESS;
const THIRDWEB_BACKEND_SMART_ACCOUNT_ADDRESS = import.meta.env
  .VITE_THIRDWEB_BACKEND_SMART_ACCOUNT_ADDRESS;

const { web3Account } = useWeb3();
const balanceData = ref<string | null>(null);

const showResultDialog = ref(false);
const resultDialogContent = ref({ title: '', description: '' });
const isProcessing = ref(false);
const widget = ref<ZkMeWidget | null>(null);

const props = defineProps<{
  user?: boolean;
  done?: boolean;
}>();

async function fetchVoterIdBalance() {
  if (!web3Account.value) return;

  const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
  const abi = [
    "function balanceOf(address owner) view returns (uint256)"
  ];
  const contract = new ethers.Contract(GLOBAL_VOTER_ID_ZKME_ADDRESS, abi, provider);

  const balance = await contract.balanceOf(web3Account.value);
  balanceData.value = ethers.utils.formatUnits(balance, 18);
}

watch(() => web3Account, fetchVoterIdBalance, { immediate: true });

async function getZkMeToken() {
  if (!ZKME_API_KEY) {
    throw new Error('ZKME_API_KEY is missing');
  }

  const response = await fetch('https://nest-api.zk.me/api/token/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'World Association'
    },
    body: JSON.stringify({
      apiKey: ZKME_API_KEY,
      appId: 'M2024053066119595336406774111128',
      apiModePermission: 1,
      lv: 2
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch zkMe token');
  }

  const data = await response.json();
  return data.data.accessToken;
}

const initializeWidget = async () => {
  if (!web3Account.value) {
    widget.value = null;
    return;
  }

  try {
    const accessToken = await getZkMeToken();

    const newProvider = {
      async getAccessToken() {
        return accessToken;
      },
      async getUserAccounts() {
        return [web3Account.value];
      }
    };

    widget.value = new ZkMeWidget(
      'M2024053066119595336406774111128',
      'World Association',
      '0x2105',
      newProvider,
      {
        lv: 'MeID',
        mode: 'wallet'
      }
    );
  } catch (error) {
    widget.value = null;
  }
};

const launchWidget = async () => {
  if (!widget.value) {
    console.error('Widget is not initialized');
    resultDialogContent.value = {
      title: 'Error',
      description: 'Widget is not initialized. Please refresh the page and try again.'
    };
    showResultDialog.value = true;
    return;
  }

  // Check if user already has a Global Voter ID
  if (balanceData.value !== null && parseFloat(balanceData.value) > 0) {
    resultDialogContent.value = {
      title: 'Congratulations!',
      description: 'You already have a Global Voter ID.'
    };
    showResultDialog.value = true;
    return;
  }

  try {
    const { isGrant } = await verifyMeidWithZkMeServices(
      'M2024053066119595336406774111128',
      web3Account.value
    );

    if (isGrant) {
      // User already has MeID, proceed directly to minting
      await mintMembership();
      return;
    }

    const widgetInstance = toRaw(widget.value);
    widgetInstance.launch();
    widgetInstance.on('meidFinished', async results => {
      if (results.isGrant) {
        await mintMembership();
      }
    });
  } catch (error) {
    console.error('Error launching widget:', error);
    resultDialogContent.value = {
      title: 'Error',
      description: `Failed to launch widget: ${(error as Error).message || 'Unknown error'}. Please try again later or contact support.`
    };
    showResultDialog.value = true;
  }
};

async function mintMembershipZkMe(address: string) {
  const engine = new Engine({
    url: THIRDWEB_ENGINE_URL as string,
    accessToken: THIRDWEB_ENGINE_ACCESS_TOKEN as string
  });

  try {
    await engine.erc20.mintTo(
      CHAIN,
      GLOBAL_VOTER_ID_ZKME_ADDRESS,
      THIRDWEB_BACKEND_WALLET_ADDRESS as string,
      {
        toAddress: address,
        amount: '1.0'
      },
      false,
      '',
      THIRDWEB_BACKEND_SMART_ACCOUNT_ADDRESS
    );
  } catch (error) {
    console.error('Error during minting:', error);
    throw new Error('Failed to mint membership SBT');
  }
}

const emit = defineEmits<{
  (e: 'voter-id-claimed', balance: string): void;
}>();

const mintMembership = async () => {
  if (
    !web3Account.value ||
    (balanceData &&
      balanceData.value !== null &&
      balanceData.value !== undefined &&
      parseFloat(balanceData.value) > 0)
  ) {
    return;
  }

  resultDialogContent.value = {
    title: 'Processing',
    description: 'Creating your Global Voter ID...'
  };

  isProcessing.value = true;
  showResultDialog.value = true;

  try {
    // Mint Global Voter ID
    await mintMembershipZkMe(web3Account.value);

    // Check for referral in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = urlParams.get('ref');

    // Send referral reward if applicable
    if (referrer && ethers.utils.isAddress(referrer) && referrer !== web3Account.value) {
      const engine = new Engine({
        url: THIRDWEB_ENGINE_URL as string,
        accessToken: THIRDWEB_ENGINE_ACCESS_TOKEN as string
      });

      await engine.erc20.mintTo(
        CHAIN,
        DRACHMA_CONTRACT_ADDRESS,
        THIRDWEB_BACKEND_WALLET_ADDRESS as string,
        {
          toAddress: referrer,
          amount: ethers.utils.formatUnits(REFERRAL_REWARD, 18)
        },
        false,
        '',
        THIRDWEB_BACKEND_SMART_ACCOUNT_ADDRESS
      );
    }

    resultDialogContent.value = {
      title: 'Success',
      description: 'Your Global Voter ID has been successfully created!'
    };
    emit('voter-id-claimed', '1');
  } catch (error) {
    console.error('Error in membership process:', error);
    resultDialogContent.value = {
      title: 'Error',
      description: 'There was an error while creating your Global Voter ID.'
    };
  } finally {
    isProcessing.value = false;
  }
};

const closeResultDialog = () => {
  showResultDialog.value = false;
};

watch(() => web3Account, initializeWidget, { immediate: true });
</script>

<template>
  <span class="cursor-pointer text-skin-link flex items-center gap-2.5" @click="launchWidget">
    <template v-if="props.user">
      <template v-if="props.done">
        <UiButton class="!px-0 w-[46px]">
          <IH-check class="inline-block" />
        </UiButton>
      </template>
      <template v-else>
        <UiButton class="!px-0 w-[46px]">
          <IH-plus class="inline-block" />
        </UiButton>
      </template>
    </template>
    <template v-else>
      <span><span class="text-skin-text">Create your</span> Global Voter ID</span>
    </template>
  </span>

  <Teleport to="body">
    <UiModal :open="showResultDialog" @close="closeResultDialog">
      <template #header>
        <h3>{{ resultDialogContent.title }}</h3>
      </template>
      <div class="p-4 flex flex-col space-y-2 text-center">
        <p class="text-muted-foreground text-sm p-0">
          {{ resultDialogContent.description }}
        </p>
      </div>
      <template #footer>
        <div class="flex flex-row items-center justify-center">
          <UiButton @click="closeResultDialog" class="w-40" variant="white">
            Close
          </UiButton>
        </div>
      </template>
    </UiModal>
  </Teleport>
</template>
