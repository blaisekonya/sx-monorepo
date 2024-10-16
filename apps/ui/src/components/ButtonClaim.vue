<script setup lang="ts">
import { ref, watch, toRaw } from 'vue';
import { ZkMeWidget } from '@zkmelabs/widget';
import { Engine } from '@thirdweb-dev/engine';
import { CHAIN, GLOBAL_VOTER_ID_ZKME_ADDRESS } from '../helpers/constants';
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

const launchWidget = () => {
  if (widget.value) {
    try {
      const widgetInstance = toRaw(widget.value);

      if (typeof widgetInstance.launch !== 'function') {
        throw new Error('Widget launch method is not a function');
      }

      widgetInstance.launch();

      widgetInstance.on('meidFinished', async results => {
        console.log('meidFinished event received:', results);
        if (results.isGrant) {
          await mintMembership();
        }
      });
    } catch (error) {
      console.error('Error launching widget:', error);
      resultDialogContent.value = {
        title: 'Error',
        description: `Failed to launch widget: ${(error as Error).message || 'Unknown error'
          }. Please try again later or contact support.`
      };
      showResultDialog.value = true;
    }
  } else {
    console.error('Widget is not initialized');
    resultDialogContent.value = {
      title: 'Error',
      description:
        'Widget is not initialized. Please refresh the page and try again.'
    };
    showResultDialog.value = true;
  }
};

async function mintMembershipZkMe(address: string) {
  console.log('mintMembershipZkMe called with address:', address);
  const engine = new Engine({
    url: THIRDWEB_ENGINE_URL as string,
    accessToken: THIRDWEB_ENGINE_ACCESS_TOKEN as string
  });

  try {
    console.log('Minting membership...');
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
    console.log('Minting successful');
  } catch (error) {
    console.error('Error during minting:', error);
    throw new Error('Failed to mint membership SBT');
  }
}

const mintMembership = async () => {
  console.log('mintMembership called');
  if (
    !web3Account ||
    (balanceData &&
      balanceData.value !== null &&
      balanceData.value !== undefined &&
      parseFloat(balanceData.value) > 0)
  ) {
    console.log('Membership minting skipped due to conditions not met');
    return;
  }

  isProcessing.value = true;
  showResultDialog.value = true;

  try {
    await mintMembershipZkMe(web3Account.value);
    resultDialogContent.value = {
      title: 'Success',
      description: 'Your Global Voter ID has been successfully created!'
    };
  } catch (error) {
    console.error('Error minting membership SBT:', error);
    resultDialogContent.value = {
      title: 'Error',
      description: 'There was an error while creating your Global Voter ID.'
    };
  } finally {
    isProcessing.value = false;
  }
};

const closeResultDialog = () => {
  console.log('closeResultDialog called');
  showResultDialog.value = false;
};

watch(() => web3Account, initializeWidget, { immediate: true });
</script>

<template>
  <span class="cursor-pointer text-skin-link" @click="launchWidget">
    Global Voter ID
  </span>

  <Teleport to="body">
    <UiModal :open="showResultDialog" @close="closeResultDialog">
      <template #header>
        <h3>{{ resultDialogContent.title }}</h3>
      </template>
      <div class="p-4 flex flex-col space-y-2 text-center">
        <p class="text-muted-foreground">
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
