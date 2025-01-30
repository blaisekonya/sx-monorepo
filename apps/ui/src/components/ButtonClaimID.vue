<script setup lang="ts">
import { Engine } from '@thirdweb-dev/engine';
import { verifyMeidWithZkMeServices, ZkMeWidget } from '@zkmelabs/widget';
import { ethers } from 'ethers';
import { ref, toRaw, watch } from 'vue';
import {
  CHAIN,
  DRACHMA_CONTRACT_ADDRESS,
  GLOBAL_VOTER_ID_ZKME_ADDRESS,
  REFERRAL_REWARD
} from '../helpers/constants';
import '@zkmelabs/widget/dist/style.css';

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

  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const abi = ['function balanceOf(address owner) view returns (uint256)'];
  const contract = new ethers.Contract(
    GLOBAL_VOTER_ID_ZKME_ADDRESS,
    abi,
    provider
  );

  const balance = await contract.balanceOf(web3Account.value);
  balanceData.value = ethers.formatUnits(balance, 18);
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
      description:
        'Widget is not initialized. Please refresh the page and try again.'
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
      resultDialogContent.value = {
        title: 'Verification complete',
        description:
          'You have already completed the verification check. Creating your Global Voter ID now...'
      };
      showResultDialog.value = true;
      isProcessing.value = true;

      await mintMembership(false);
      return;
    }

    const widgetInstance = toRaw(widget.value);
    widgetInstance.launch();
    widgetInstance.on('meidFinished', async results => {
      if (results.isGrant) {
        await mintMembership(false);
      }
    });
  } catch (error) {
    console.error('Error launching widget:', error);
    resultDialogContent.value = {
      title: 'Error',
      description: `Failed to launch widget: ${
        (error as Error).message || 'Unknown error'
      }. Please try again later or contact support.`
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
      resultDialogContent.value = {
        title: 'Verification complete',
        description:
          'You have already completed the verification check. Creating your Global Voter ID now...'
      };
      showResultDialog.value = true;
      isProcessing.value = true;

      await mintMembership(false);
      return;
    }

    const widgetInstance = toRaw(widget.value);
    widgetInstance.launch();
    widgetInstance.on('meidFinished', async results => {
      if (results.isGrant) {
        await mintMembership(false);
      }
    });
  } catch (error) {
    console.error('Error launching widget:', error);
    resultDialogContent.value = {
      title: 'Error',
      description: `Failed to launch widget: ${
        (error as Error).message || 'Unknown error'
      }. Please try again later or contact support.`
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
  (e: 'voter-id-claimed', balance: string): void
}>();

const mintMembership = async (updateDialog = true) => {
  if (
    !web3Account.value ||
    (balanceData.value &&
      balanceData.value !== null &&
      balanceData.value !== undefined &&
      parseFloat(balanceData.value) > 0)
  ) {
    return;
  }

  if (updateDialog) {
    resultDialogContent.value = {
      title: 'Processing',
      description: 'Creating your Global Voter ID...'
    };
  }

  isProcessing.value = true;
  showResultDialog.value = true;

  try {
    // Mint Global Voter ID
    await mintMembershipZkMe(web3Account.value);

    // Check for referral in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = urlParams.get('ref');

    // Send referral reward if applicable
    if (
      referrer &&
      ethers.isAddress(referrer) &&
      referrer !== web3Account.value
    ) {
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
          amount: ethers.formatUnits(REFERRAL_REWARD, 18)
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

const showVoterIdInfo = ref(false);

const closeVoterIdInfo = () => {
  showVoterIdInfo.value = false;
};

const handleStartVerification = () => {
  closeVoterIdInfo();
  launchWidget();
};
</script>

<template>
  <span class="cursor-pointer text-skin-link flex items-center gap-2.5">
    <template v-if="props.user">
      <template v-if="props.done">
        <a
          href="https://basescan.org/token/0x762CEc1f35e517Da6C178262F8864Fd92b70A20b"
          target="_blank"
          rel="noopener noreferrer"
          class="!px-0 w-[46px] inline-flex items-center justify-center"
        >
          <UiButton class="!px-0 w-[46px]"
            ><IH-check class="inline-block"
          /></UiButton>
        </a>
      </template>
      <template v-else>
        <UiButton class="!px-0 w-[46px]" @click="showVoterIdInfo = true">
          <IH-plus class="inline-block" />
        </UiButton>
      </template>
    </template>
    <template v-else>
      <span @click="showVoterIdInfo = true"
        ><span class="text-skin-text">Create your</span> Global Voter ID</span
      >
    </template>
  </span>

  <Teleport to="body">
    <UiModal :open="showResultDialog" @close="closeResultDialog">
      <template #header>
        <h3>{{ resultDialogContent.title }}</h3>
      </template>
      <div class="flex flex-col items-center space-y-3 p-4">
        <template v-if="isProcessing">
          <UiLoading class="mb-2" />
          <p class="text-muted-foreground text-sm">
            {{ resultDialogContent.description }}
          </p>
        </template>
        <template v-else>
          <div
            v-if="resultDialogContent.title === 'Success'"
            class="bg-skin-success rounded-full p-[12px]"
          >
            <IS-check :width="28" :height="28" class="text-skin-bg" />
          </div>
          <div
            v-else-if="resultDialogContent.title === 'Error'"
            class="bg-skin-danger rounded-full p-[12px]"
          >
            <IS-x-mark :width="28" :height="28" class="text-skin-bg" />
          </div>
          <p class="text-muted-foreground text-sm">
            {{ resultDialogContent.description }}
          </p>
        </template>
      </div>
      <template #footer>
        <div class="flex flex-row items-center justify-center">
          <UiButton class="w-40" variant="white" @click="closeResultDialog">
            Close
          </UiButton>
        </div>
      </template>
    </UiModal>

    <UiModal :open="showVoterIdInfo" :max-width="480" @close="closeVoterIdInfo">
      <template #header>
        <div class="relative">
          <h3 class="text-[22px]">Create your Global Voter ID</h3>
        </div>
      </template>

      <div class="flex flex-col gap-4 p-4">
        <div class="flex flex-col items-center text-center gap-3">
          <div class="text-skin-text text-sm">
            Claim your Global Voter ID and start experimenting with global
            democracy.
          </div>
        </div>

        <div>
          <div class="flex items-start gap-3 py-2">
            <div
              class="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-skin-primary text-skin-bg font-medium"
            >
              1
            </div>
            <div>
              <h4 class="font-medium text-[18px] mb-1">
                Prove your personhood
              </h4>
              <p class="text-sm text-skin-text">
                Complete a privacy-preserving biometric check to verify that you
                are a real and unique person
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3 py-2">
            <div
              class="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-skin-primary text-skin-bg font-medium"
            >
              2
            </div>
            <div>
              <h4 class="font-medium text-[18px] mb-1">Receive your ID</h4>
              <p class="text-sm text-skin-text">
                Collect your non-transferable Global Voter ID
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3 pt-2">
            <div
              class="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-skin-primary text-skin-bg font-medium"
            >
              3
            </div>
            <div>
              <h4 class="font-medium text-[18px] mb-1">
                Make your voice heard
              </h4>
              <p class="text-sm text-skin-text">
                Participate in our experiments and shape the future of global
                governance
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <UiButton @click="closeVoterIdInfo">Later</UiButton>
          <UiButton class="primary" @click="handleStartVerification">
            Get started
          </UiButton>
        </div>
      </template>
    </UiModal>
  </Teleport>
</template>
