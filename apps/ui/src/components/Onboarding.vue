<script setup lang="ts">
import { lsGet, lsSet } from '@/helpers/utils';
import { ref, computed, watch, onMounted } from 'vue';
import { ethers } from 'ethers';
import { GLOBAL_VOTER_ID_ZKME_ADDRESS } from '../helpers/constants';
import ButtonClaimID from './ButtonClaimID.vue';

const usersStore = useUsersStore();
const { web3 } = useWeb3();
const followedSpacesStore = useFollowedSpacesStore();

const user = computed(() => {
  if (
    !web3.value.authLoading &&
    web3.value.account &&
    followedSpacesStore.followedSpacesLoaded
  ) {
    return usersStore.getUser(web3.value.account);
  } else {
    return null;
  }
});

const voterIdBalance = ref<string | null>(null);
const loading = ref(true);

async function fetchVoterIdBalance() {
  if (!web3.value.account) return;

  try {
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
    const abi = [
      "function balanceOf(address owner) view returns (uint256)"
    ];
    const contract = new ethers.Contract(GLOBAL_VOTER_ID_ZKME_ADDRESS, abi, provider);

    const balance = await contract.balanceOf(web3.value.account);
    voterIdBalance.value = ethers.utils.formatUnits(balance, 18);
  } catch (error) {
    console.error('Error fetching voter ID balance:', error);
    voterIdBalance.value = '0';
  } finally {
    loading.value = false;
  }
}

watch(() => web3.value.account, fetchVoterIdBalance, { immediate: true });

const tasks = computed(() => ({
  voterId: !voterIdBalance.value || parseFloat(voterIdBalance.value) === 0,
  basicIncome: true,
  following: !followedSpacesStore.isFollowed('s:worldassociation.eth'),
  votes: !user.value?.votesCount
}));

const hasPendingTasks = computed(() =>
  Object.values(tasks.value).includes(true)
);

watch(
  hasPendingTasks,
  value => {
    lsSet('showOnboarding', {
      ...lsGet('showOnboarding'),
      [web3.value.account]: !value ? false : undefined
    });
  },
  { immediate: true }
);

onMounted(async () => {
  const pending = lsGet('showOnboarding')?.[web3.value.account] ?? true;
  if (pending && web3.value.account)
    await usersStore.fetchUser(web3.value.account, true);
});

const isVoterIdBalanceLoaded = computed(() => voterIdBalance.value !== null);
</script>

<template>
  <div v-if="loading">
    <UiLabel label="onboarding" sticky class="mb-4" />
    <UiLoading class="p-4" />
  </div>
  <div v-else-if="user && hasPendingTasks && isVoterIdBalanceLoaded">
    <UiLabel label="onboarding" sticky />
    <div v-if="tasks.voterId" class="border-b mx-4 py-[14px] flex gap-x-2.5">
      <div><IS-flag class="text-skin-link mt-0.5" /></div>
      <div class="grow">
        Create your
        <ButtonClaimID />
      </div>
    </div>

    <div v-if="tasks.basicIncome" class="border-b mx-4 py-[14px] flex gap-x-2.5">
      <div><IS-flag class="text-skin-link mt-0.5" /></div>
      <div class="grow">
        <ButtonClaimBasicIncome />
      </div>
    </div>

    <div v-if="tasks.following" class="border-b mx-4 py-[14px] flex gap-x-2.5">
      <div><IS-flag class="text-skin-link mt-0.5" /></div>
      <div class="grow">
        Follow the
        <AppLink :to="'/s:worldassociation.eth'"> World Association </AppLink>
      </div>
    </div>

    <div v-if="tasks.votes && !tasks.voterId" class="border-b mx-4 py-[14px] flex gap-x-2.5">
      <div><IS-flag class="text-skin-link mt-0.5" /></div>
      <div class="grow">Cast your first vote</div>
    </div>

    <div v-if="!tasks.voterId" class="border-b mx-4 py-[14px] flex gap-x-2.5">
      <div><IS-flag class="text-skin-link mt-0.5" /></div>
      <div class="grow">
        Create a
        <AppLink :to="'/s:polls.worldassociation.eth'"> poll </AppLink>
        or start a
        <AppLink :to="'/s:petitions.worldassociation.eth'"> petition </AppLink>
      </div>
    </div>
  </div>
</template>
