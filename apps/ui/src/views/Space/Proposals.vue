<script setup lang="ts">
import { LocationQueryRaw } from 'vue-router';
import ProposalIconStatus from '@/components/ProposalIconStatus.vue';
import { ProposalsFilter } from '@/networks/types';
import { Space } from '@/types';

const props = defineProps<{ space: Space }>();

const { setTitle } = useTitle();
const { get: getVotingPower, fetch: fetchVotingPower } = useVotingPower();
const { web3 } = useWeb3();
const router = useRouter();
const route = useRoute();
const proposalsStore = useProposalsStore();

const state = ref<NonNullable<ProposalsFilter['state']>>('any');
const labels = ref<string[]>([]);

const selectIconBaseProps = {
  size: 16
};

const proposalsRecord = computed(
  () => proposalsStore.proposals[`${props.space.network}:${props.space.id}`]
);

const votingPower = computed(() => getVotingPower(props.space));

const spaceLabels = computed(() => {
  if (!props.space.labels) return {};

  return Object.fromEntries(props.space.labels.map(label => [label.id, label]));
});

function handleClearLabelsFilter(close: () => void) {
  labels.value = [];
  close();
}

async function handleEndReached() {
  if (!proposalsRecord.value?.hasMoreProposals) return;

  proposalsStore.fetchMore(props.space.id, props.space.network);
}

function handleFetchVotingPower() {
  fetchVotingPower(props.space);
}

watchThrottled(
  [
    () => route.query.state as string,
    () => route.query.labels as string[] | string
  ],
  ([toState, toLabels]) => {
    state.value = ['any', 'active', 'pending', 'closed'].includes(toState)
      ? (toState as NonNullable<ProposalsFilter['state']>)
      : 'any';
    let normalizedLabels = toLabels || [];
    normalizedLabels = Array.isArray(normalizedLabels)
      ? normalizedLabels
      : [normalizedLabels];
    labels.value = normalizedLabels.filter(id => spaceLabels.value[id]);

    proposalsStore.reset(props.space.id, props.space.network);
    proposalsStore.fetch(props.space.id, props.space.network, {
      state: state.value,
      labels: labels.value
    });
  },
  { throttle: 1000, immediate: true }
);

watch(
  [props.space, state, labels],
  ([toSpace, toState, toLabels], [fromSpace, fromState, fromLabels]) => {
    if (
      toSpace.id !== fromSpace?.id ||
      toState !== fromState ||
      toLabels !== fromLabels
    ) {
      const query: LocationQueryRaw = {
        ...route.query,
        state: toState === 'any' ? undefined : toState,
        labels: !toLabels?.length ? undefined : toLabels
      };

      router.push({ query });
    }
  },
  { immediate: true }
);

watch(
  [props.space, () => web3.value.account, () => web3.value.authLoading],
  ([proposal, account, authLoading]) => {
    if (authLoading || !proposal || !account) return;

    handleFetchVotingPower();
  },
  { immediate: true }
);

watchEffect(() => setTitle(`Proposals - ${props.space.name}`));
</script>

<template>
  <div>
    <div
      class="flex justify-between p-4 gap-2 gap-y-3 flex-row"
      :class="{ 'flex-col-reverse sm:flex-row': space.labels?.length }"
    >
      <div class="flex gap-2">
        <UiSelectDropdown
          v-model="state"
          title="Status"
          gap="12"
          placement="start"
          :items="[
            {
              key: 'any',
              label: 'Any'
            },
            {
              key: 'pending',
              label: 'Pending',
              component: ProposalIconStatus,
              componentProps: { ...selectIconBaseProps, state: 'pending' }
            },
            {
              key: 'active',
              label: 'Active',
              component: ProposalIconStatus,
              componentProps: { ...selectIconBaseProps, state: 'active' }
            },
            {
              key: 'closed',
              label: 'Closed',
              component: ProposalIconStatus,
              componentProps: { ...selectIconBaseProps, state: 'passed' }
            }
          ]"
        />
      </div>
      <div class="flex gap-2 truncate">
        <IndicatorVotingPower
          :network-id="space.network"
          :voting-power="votingPower"
          @fetch-voting-power="handleFetchVotingPower"
        />
        <UiTooltip title="New proposal">
          <UiButton
            :to="{
              name: 'space-editor',
              params: { space: `${space.network}:${space.id}` }
            }"
            class="!px-0 w-[46px]"
          >
            <IH-pencil-alt />
          </UiButton>
        </UiTooltip>
      </div>
    </div>
    <ProposalsList
      title="Proposals"
      limit="off"
      :loading="!proposalsRecord?.loaded"
      :loading-more="proposalsRecord?.loadingMore"
      :proposals="
        proposalsStore.getSpaceProposals(props.space.id, props.space.network)
      "
      @end-reached="handleEndReached"
    />
  </div>
</template>
