<script setup lang="ts">
import { getInjected } from '@snapshot-labs/lock/src/utils';
import connectors, {
  getConnectorIconUrl,
  mapConnectorId
} from '@/helpers/connectors';
import { getCacheHash } from '@/helpers/utils';

const win = window;

const injected = getInjected();
if (injected)
  connectors['injected'] = {
    ...connectors['injected'],
    ...injected,
    id: 'injected',
    icon: connectors[mapConnectorId(injected.id)]?.icon ?? injected.icon
  };

const props = defineProps<{
  open: boolean;
}>();
const emit = defineEmits<{
  (e: 'login', connector: string): void;
  (e: 'close'): void;
}>();

const { open } = toRefs(props);
const { web3, logout, login } = useWeb3();
const usersStore = useUsersStore();
const step: Ref<'connect' | null> = ref(null);

const availableConnectors = computed(() => {
  return Object.values(connectors).filter(connector => {
    const hasNoType = !('type' in connector) || !connector.type;
    const isActive =
      'type' in connector &&
      'root' in connector &&
      connector.type === 'injected' &&
      win[connector.root];

    return hasNoType || isActive;
  });
});

const user = computed(
  () =>
    usersStore.getUser(web3.value.account) || {
      id: web3.value.account,
      avatar: undefined
    }
);

const cb = computed(() => getCacheHash(user.value.avatar));

const isLoggedOut = computed(
  () => !web3.value.account || step.value === 'connect'
);

const loading = ref(false);

async function handleLogout() {
  await logout();
  emit('close');
}

watch(open, () => (step.value = null));

const showConnectors = ref(false);

function handleLoginClick() {
  showConnectors.value = !showConnectors.value;
}

async function handleLogin(connector: string) {
  loading.value = true;
  try {
    await login(connector);
    emit('close');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template #header>
      <div class="relative">
        <h3 v-text="isLoggedOut
          ? showConnectors
            ? 'Connect wallet'
            : 'Sign in'
          : 'Account'
          " />
      </div>
    </template>
    <div class="m-4 flex flex-col gap-2">
      <template v-if="isLoggedOut">
        <template v-if="!showConnectors">
          <UiButton class="w-full flex justify-center items-center gap-2" @click="handleLogin('walletlink')">
            <img :src="getConnectorIconUrl(connectors.walletlink.icon)" height="28" width="28"
              :alt="connectors.walletlink.name" />
            Log in
          </UiButton>
          <UiButton class="w-full flex justify-center items-center gap-2" @click="handleLogin('walletlink')">
            <img :src="getConnectorIconUrl(connectors.walletlink.icon)" height="28" width="28"
              :alt="connectors.walletlink.name" />
            Sign up
          </UiButton>
          <div class="flex items-center my-1">
            <div class="flex-grow border-t border-skin-border"></div>
            <span class="mx-2 text-skin-content text-sm">OR</span>
            <div class="flex-grow border-t border-skin-border"></div>
          </div>
          <UiButton @click="handleLoginClick"> Connect wallet </UiButton>
        </template>
        <template v-else>
          <button v-for="connector in availableConnectors" :key="connector.id" type="button"
            @click="handleLogin(connector.id)">
            <UiButton class="w-full flex justify-center items-center gap-2">
              <img :src="getConnectorIconUrl(connector.icon)" height="28" width="28" :alt="connector.name" />
              {{ connector.name }}
            </UiButton>
          </button>
          <div class="flex items-center my-1">
            <div class="flex-grow border-t border-skin-border"></div>
            <span class="mx-2 text-skin-content text-sm">OR</span>
            <div class="flex-grow border-t border-skin-border"></div>
          </div>
          <UiButton class="w-full flex justify-center items-center gap-2" @click="showConnectors = false">
            Sign in
          </UiButton>
        </template>
      </template>
      <template v-else>
        <UiButton :to="{ name: 'user', params: { user: web3.account } }" class="gap-2" @click="emit('close')">
          <UiStamp :id="user.id" :size="18" :cb="cb" />
          My profile
        </UiButton>
        <UiButton :to="{ name: 'settings-spaces' }" @click="emit('close')">
          Settings
        </UiButton>
        <UiButton @click="() => {
          step = 'connect';
          showConnectors = true;
        }
          ">
          {{ web3.account ? 'Change wallet' : 'Log in' }}
        </UiButton>
        <UiButton class="!text-skin-danger" @click="() => {
          handleLogout();
          handleLoginClick();
        }
          ">
          Log out
        </UiButton>
      </template>
    </div>
  </UiModal>
</template>
