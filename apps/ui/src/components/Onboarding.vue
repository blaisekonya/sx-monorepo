<script setup lang="ts">
import { useTasksStore } from '@/stores/tasks';
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

const tasks = computed(() => ({
  profile: !user.value?.created,
  voterId: !tasksStore.voterIdBalance || parseFloat(tasksStore.voterIdBalance) === 0,
  basicIncome: !tasksStore.basicIncomeSetUp,
  followingWorldAssociation: !followedSpacesStore.isFollowed('s:worldassociation.eth'),
  followingGlobalDemocracy: !followedSpacesStore.isFollowed('s:globaldemocracy.eth'),
  votes: !user.value?.votesCount
}));

const hasPendingTasks = computed(() =>
  Object.values(tasks.value).includes(true)
);

watch(() => web3.value.account, () => {
  if (web3.value.account) {
    tasksStore.fetchVoterIdBalance();
    tasksStore.fetchBasicIncomeStatus();
  }
}, { immediate: true });

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
  <div v-else-if="user && hasPendingTasks && tasksStore.voterIdBalance !== null">
    <UiLabel label="onboarding" :sticky-offset="72" />
    <div v-if="tasks.profile" class="border-b mx-4 py-[14px] flex gap-x-2.5">
      <div><IS-flag class="text-skin-link mt-0.5" /></div>
      <div class="grow">
        <AppLink :to="{ name: 'user', params: { user: user.id } }">
          <span class="text-skin-text">Setup your</span> profile
        </AppLink>
      </div>
    </div>

    <div v-if="tasks.voterId" class="border-b mx-4 py-[14px] flex gap-x-2.5">
      <div><IS-flag class="text-skin-link mt-0.5" /></div>
      <div class="grow">
        <ButtonClaimID @voter-id-claimed="balance => tasksStore.voterIdBalance = balance" />
      </div>
    </div>

    <div v-if="tasks.basicIncome" class="border-b mx-4 py-[14px] flex gap-x-2.5">
      <div><IS-flag class="text-skin-link mt-0.5" /></div>
      <div class="grow">
        <ButtonClaimBasicIncome />
      </div>
    </div>

    <div v-if="tasks.followingWorldAssociation" class="border-b mx-4 py-[14px] flex gap-x-2.5">
      <div><IS-flag class="text-skin-link mt-0.5" /></div>
      <div class="grow">
        <AppLink :to="'/s:worldassociation.eth'">
          <span class="text-skin-text">Follow the</span> World Association
        </AppLink>
      </div>
    </div>

    <div v-if="tasks.followingGlobalDemocracy" class="border-b mx-4 py-[14px] flex gap-x-2.5">
      <div><IS-flag class="text-skin-link mt-0.5" /></div>
      <div class="grow">
        <AppLink :to="'/s:globaldemocracy.eth'">
          <span class="text-skin-text">Follow the</span> Global Democracy <span class="text-skin-text">space</span>
        </AppLink>
      </div>
    </div>

    <div v-if="tasks.votes && !tasks.voterId" class="border-b mx-4 py-[14px] flex gap-x-2.5">
      <div><IS-flag class="text-skin-link mt-0.5" /></div>
      <div class="grow">Cast your first <span class="text-skin-link">vote</span></div>
    </div>
  </div>
</template>
