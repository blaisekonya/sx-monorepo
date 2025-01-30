<script setup lang="ts">
import { ethers } from 'ethers';
import { computed, onMounted, ref, watch } from 'vue';
import { useWeb3 } from '@/composables/useWeb3';
import { GLOBAL_VOTER_ID_ZKME_ADDRESS } from '@/helpers/constants';
import { useFollowedSpacesStore } from '@/stores/followedSpaces';
import { useTasksStore } from '@/stores/tasks';
import { useUsersStore } from '@/stores/users';
import ButtonClaimID from './ButtonClaimID.vue';

const usersStore = useUsersStore();
const { web3 } = useWeb3();
const followedSpacesStore = useFollowedSpacesStore();
const tasksStore = useTasksStore();

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

async function fetchVoterIdBalance() {
  if (!web3.value.account) return;

  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const abi = ['function balanceOf(address owner) view returns (uint256)'];
  const contract = new ethers.Contract(
    GLOBAL_VOTER_ID_ZKME_ADDRESS,
    abi,
    provider
  );

  const balance = await contract.balanceOf(web3.value.account);
  voterIdBalance.value = ethers.formatUnits(balance, 18);
}

watch(() => web3.value.account, fetchVoterIdBalance, { immediate: true });

const tasks = computed(() => ({
  voterId:
    !tasksStore.voterIdBalance || parseFloat(tasksStore.voterIdBalance) === 0,
  followingWorldRepublic: !followedSpacesStore.isFollowed('s:worldrepublic.eth')
}));

const hasPendingTasks = computed(() =>
  Object.values(tasks.value).includes(true)
);

watch(
  () => web3.value.account,
  () => {
    if (web3.value.account) {
      tasksStore.fetchVoterIdBalance();
    }
  },
  { immediate: true }
);

onMounted(async () => {
  if (web3.value.account) {
    await usersStore.fetchUser(web3.value.account, true);
  }
});
</script>

<template>
  <div v-if="user && tasksStore.loading">
    <UiLabel label="onboarding" :sticky-offset="72" />
    <div class="mx-4">
      <div class="border-b py-[14px] flex gap-x-2.5">
        <div><IS-flag class="text-skin-text/10 mt-0.5" /></div>
        <UiSkeleton class="my-1 h-[18px] w-[120px]" />
      </div>
      <div class="border-b py-[14px] flex gap-x-2.5">
        <div><IS-flag class="text-skin-text/10 mt-0.5" /></div>
        <UiSkeleton class="my-1 h-[17px] w-[120px]" />
      </div>
    </div>
  </div>
  <div
    v-else-if="user && hasPendingTasks && tasksStore.voterIdBalance !== null"
  >
    <UiLabel label="onboarding" :sticky-offset="72" />
    <div
      v-if="tasks.followingWorldRepublic"
      class="border-b mx-4 py-[14px] flex gap-x-2.5"
    >
      <div><IS-flag class="text-skin-link mt-0.5" /></div>
      <div class="grow">
        <AppLink :to="'/s:worldrepublic.eth'">
          <span class="text-skin-text">Follow the</span> World Republic
        </AppLink>
      </div>
    </div>

    <div v-if="tasks.voterId" class="border-b mx-4 py-[14px] flex gap-x-2.5">
      <div><IS-flag class="text-skin-link mt-0.5" /></div>
      <div class="grow">
        <ButtonClaimID
          @voter-id-claimed="balance => (tasksStore.voterIdBalance = balance)"
        />
      </div>
    </div>
  </div>
</template>
