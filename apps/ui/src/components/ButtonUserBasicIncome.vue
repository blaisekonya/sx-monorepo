<script setup lang="ts">
import { Engine } from '@thirdweb-dev/engine';
import { ZkMeWidget } from '@zkmelabs/widget';
import { ethers } from 'ethers';
import { computed, ref, watch } from 'vue';
import {
  CFA_V1_FORWARDER_ABI,
  CFA_V1_FORWARDER_ADDRESS,
  CHAIN,
  DRACHMA_CONTRACT_ADDRESS,
  DRACHMA_TREASURY_ADDRESS,
  FLOW_RATE,
  GLOBAL_VOTER_ID_ZKME_ADDRESS,
  STREAM_LINK_TEMPLATE
} from '../helpers/constants';
import '@zkmelabs/widget/dist/style.css';
import ModalBasicIncomeStream from './Modal/BasicIncomeStream.vue';

const {
  VITE_THIRDWEB_ENGINE_URL,
  VITE_THIRDWEB_ENGINE_ACCESS_TOKEN,
  VITE_THIRDWEB_BACKEND_WALLET_ADDRESS,
  VITE_THIRDWEB_BACKEND_SMART_ACCOUNT_ADDRESS
} = import.meta.env;

if (!VITE_THIRDWEB_ENGINE_URL)
  throw new Error('VITE_THIRDWEB_ENGINE_URL is missing');
if (!VITE_THIRDWEB_ENGINE_ACCESS_TOKEN)
  throw new Error('VITE_THIRDWEB_ENGINE_ACCESS_TOKEN is missing');
if (!VITE_THIRDWEB_BACKEND_WALLET_ADDRESS)
  throw new Error('VITE_THIRDWEB_BACKEND_WALLET_ADDRESS is missing');
if (!VITE_THIRDWEB_BACKEND_SMART_ACCOUNT_ADDRESS)
  throw new Error('VITE_THIRDWEB_BACKEND_SMART_ACCOUNT_ADDRESS is missing');

const { web3Account } = useWeb3();

const isBasicIncomeSetUp = ref(false);
const flowrateData = ref<ethers.BigNumber | null>(null);
const balanceData = ref<ethers.BigNumber | null>(null);

const widget = ref<ZkMeWidget | null>(null);

const showResultDialog = ref(false);
const resultDialogContent = ref({
  title: '',
  description: ''
});
const isProcessing = ref(false);
const isSuccess = ref(false);
const isButtonDisabled = ref(false);
const countdown = ref(8);
const isLoading = ref(true);
const showStreamModal = ref(false);
const showBasicIncomeInfo = ref(false);

const fetchFlowrateData = async () => {
  if (!web3Account.value) {
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  const provider = new ethers.providers.JsonRpcProvider(
    'https://mainnet.base.org'
  );
  const contract = new ethers.Contract(
    CFA_V1_FORWARDER_ADDRESS,
    CFA_V1_FORWARDER_ABI,
    provider
  );

  try {
    const flowrate = await contract.getAccountFlowrate(
      DRACHMA_CONTRACT_ADDRESS,
      web3Account.value
    );
    flowrateData.value = flowrate;
    isBasicIncomeSetUp.value = flowrate.gt(ethers.constants.Zero);
  } catch (error) {
    console.error('Error fetching flowrate:', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchBalanceData = async () => {
  if (!web3Account.value) {
    return;
  }

  const provider = new ethers.providers.JsonRpcProvider(
    'https://mainnet.base.org'
  );
  const abi = ['function balanceOf(address owner) view returns (uint256)'];
  const contract = new ethers.Contract(
    GLOBAL_VOTER_ID_ZKME_ADDRESS,
    abi,
    provider
  );

  try {
    const balance = await contract.balanceOf(web3Account.value);
    balanceData.value = balance;
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
};

watch(
  () => web3Account.value,
  () => {
    fetchFlowrateData();
    fetchBalanceData();
  },
  { immediate: true }
);

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
    console.error('Error initializing widget:', error);
    widget.value = null;
  }
};

watch(web3Account, initializeWidget, { immediate: true });

async function createDrachmaStream(address: string, flowRate: bigint) {
  const engine = new Engine({
    url: VITE_THIRDWEB_ENGINE_URL as string,
    accessToken: VITE_THIRDWEB_ENGINE_ACCESS_TOKEN as string
  });

  try {
    await engine.contract.write(
      CHAIN,
      CFA_V1_FORWARDER_ADDRESS,
      VITE_THIRDWEB_BACKEND_WALLET_ADDRESS as string,
      {
        functionName: 'createFlow',
        args: [
          DRACHMA_CONTRACT_ADDRESS,
          DRACHMA_TREASURY_ADDRESS as string,
          address,
          flowRate.toString(),
          '0x0000000000000000000000000000000000000000'
        ]
      },
      false,
      '',
      VITE_THIRDWEB_BACKEND_SMART_ACCOUNT_ADDRESS
    );
  } catch (error) {
    console.error('Error during stream creation:', error);
    throw new Error('Failed to create stream');
  }
}

async function getZkMeToken() {
  const { VITE_ZKME_API_KEY } = import.meta.env;

  if (!VITE_ZKME_API_KEY) {
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
      apiKey: VITE_ZKME_API_KEY,
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

const handleLaunchWidget = async () => {
  const widgetInstance = toRaw(widget.value);
  if (widgetInstance) {
    widgetInstance.launch();
    widgetInstance.on('meidFinished', async results => {
      if (results.isGrant) {
        await handleCreateDrachmaStream();
      }
    });
  } else {
    console.log('Widget is null, cannot launch');
  }
};

const handleCreateDrachmaStream = async () => {
  if (!web3Account.value) {
    return;
  }

  isProcessing.value = true;
  showResultDialog.value = true;
  resultDialogContent.value = {
    title: 'Processing',
    description: 'Creating your basic income stream...'
  };

  const newFlowRate = ethers.BigNumber.from(FLOW_RATE);

  try {
    await createDrachmaStream(web3Account.value, newFlowRate.toBigInt());
    resultDialogContent.value = {
      title: 'Stream created',
      description: 'Your basic income stream has been successfully created.'
    };
    isBasicIncomeSetUp.value = true;
    fetchFlowrateData();
    isSuccess.value = true;
    isButtonDisabled.value = true;
    countdown.value = 8;
    startCountdown();
  } catch (error) {
    console.error('Error in handleCreateDrachmaStream:', error);
    resultDialogContent.value = {
      title: 'Error',
      description: 'Failed to create basic income stream. Please try again.'
    };
    isSuccess.value = false;
  } finally {
    isProcessing.value = false;
  }
};

const startCountdown = () => {
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value === 0) {
      clearInterval(timer);
      isButtonDisabled.value = false;
      isBasicIncomeSetUp.value = true;
    }
  }, 1000);
};

const getUserStreamLink = computed(() => {
  if (!web3Account.value) return '';
  return STREAM_LINK_TEMPLATE.replace(/address/g, web3Account.value);
});

const closeResultDialog = () => {
  showResultDialog.value = false;
};

const closeBasicIncomeInfo = () => {
  showBasicIncomeInfo.value = false;
};

const handleStartVerification = () => {
  closeBasicIncomeInfo();
  handleLaunchWidget();
};
</script>

<template>
  <template v-if="isLoading">
    <span class="flex items-center justify-between w-full">
      <UiSkeleton class="h-[18px] w-[152px]" />
      <div class="2xl:ml-3">
        <UiSkeleton class="h-[46px] w-[46px] !rounded-full" />
      </div>
    </span>
  </template>
  <template v-else>
    <span class="w-full">
      <template v-if="isBasicIncomeSetUp">
        <div class="flex items-center justify-between w-full">
          <span>Basic income active</span>
          <div class="2xl:ml-3">
            <UiButton class="!px-0 w-[46px]" @click="showStreamModal = true">
              <IH-banknotes class="inline-block" />
            </UiButton>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="flex items-center justify-between w-full">
          <span>Claim your basic income</span>
          <div class="2xl:ml-3">
            <UiButton
              class="!px-0 w-[46px]"
              @click="showBasicIncomeInfo = true"
            >
              <IH-plus class="inline-block" />
            </UiButton>
          </div>
        </div>
      </template>
    </span>

    <Teleport to="body">
      <ModalBasicIncomeStream
        :open="showStreamModal"
        :stream-url="getUserStreamLink"
        @close="showStreamModal = false"
      />
    </Teleport>
  </template>

  <Teleport to="body">
    <UiModal :open="showResultDialog" @close="closeResultDialog">
      <template #header>
        <h3>{{ resultDialogContent.title }}</h3>
      </template>
      <div class="p-4 flex flex-col items-center space-y-3 text-center">
        <template v-if="isProcessing">
          <UiLoading class="mb-2" />
          <p class="text-muted-foreground text-sm">
            {{ resultDialogContent.description }}
          </p>
        </template>
        <template v-else>
          <div
            v-if="resultDialogContent.title === 'Stream created'"
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
        <div
          class="flex flex-row items-center gap-2"
          :class="isSuccess ? 'justify-between' : 'justify-center'"
        >
          <UiButton
            class="w-40"
            :variant="isSuccess ? 'outline' : 'default'"
            @click="closeResultDialog"
          >
            Close
          </UiButton>
          <template v-if="isSuccess">
            <a
              :href="getUserStreamLink"
              target="_blank"
              rel="noopener noreferrer"
              class="w-40 sm:w-auto"
            >
              <UiButton
                class="w-[160px] flex items-center justify-center"
                :disabled="isButtonDisabled"
              >
                {{
                  isButtonDisabled
                    ? `View stream (${countdown}s)`
                    : 'View stream'
                }}
                <IH-arrow-up-right
                  v-if="!isButtonDisabled"
                  class="ml-1 h-[12px] w-[12px]"
                />
              </UiButton>
            </a>
          </template>
        </div>
      </template>
    </UiModal>
  </Teleport>

  <UiModal
    :open="showBasicIncomeInfo"
    :max-width="480"
    @close="closeBasicIncomeInfo"
  >
    <template #header>
      <div class="relative">
        <h3 class="text-[22px]">Set up your basic income</h3>
      </div>
    </template>

    <div class="flex flex-col gap-4 p-4">
      <!-- Hero Section -->
      <div class="flex flex-col items-center text-center gap-3">
        <div class="text-skin-text text-sm">
          Join our basic income program and receive a continuous stream of our
          official currency.
        </div>
      </div>

      <!-- Steps -->
      <div>
        <div class="flex items-start gap-3 py-2">
          <div
            class="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-skin-primary text-skin-bg font-medium"
          >
            1
          </div>
          <div>
            <h4 class="font-medium text-[18px] mb-1">Prove your personhood</h4>
            <p class="text-sm text-skin-text">
              Complete a privacy-preserving biometric check to ensure fair
              distribution - one person, one income
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
            <h4 class="font-medium text-[18px] mb-1">Activate your stream</h4>
            <p class="text-sm text-skin-text">
              Your income starts flowing immediately after verification
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
            <h4 class="font-medium text-[18px] mb-1">Spend anywhere</h4>
            <p class="text-sm text-skin-text">
              Use your drachma freely for everyday transactions
            </p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between">
        <UiButton @click="closeBasicIncomeInfo">Later</UiButton>
        <UiButton class="primary" @click="handleStartVerification">
          Get started
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
