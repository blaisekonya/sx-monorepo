<script setup lang="ts">
import { getBoostsCount } from '@/helpers/boost';
import { HELPDESK_URL } from '@/helpers/constants';
import { loadSingleTopic, Topic } from '@/helpers/discourse';
import { getFormattedVotingPower, sanitizeUrl } from '@/helpers/utils';
import { Choice, Space } from '@/types';

const props = defineProps<{
  space: Space;
}>();

const route = useRoute();
const proposalsStore = useProposalsStore();
const {
  get: getVotingPower,
  fetch: fetchVotingPower,
  reset: resetVotingPower
} = useVotingPower();
const { setTitle } = useTitle();
const { web3 } = useWeb3();
const { modalAccountOpen } = useModal();
const termsStore = useTermsStore();

const modalOpenVote = ref(false);
const modalOpenTerms = ref(false);
const selectedChoice = ref<Choice | null>(null);
const { votes } = useAccount();
const editMode = ref(false);
const discourseTopic: Ref<Topic | null> = ref(null);
const boostCount = ref(0);

const id = computed(() => route.params.proposal as string);
const proposal = computed(() => {
  return proposalsStore.getProposal(
    props.space.id,
    id.value,
    props.space.network
  );
});

const discussion = computed(() => {
  if (!proposal.value) return null;

  return sanitizeUrl(proposal.value.discussion);
});

const votingPower = computed(() => {
  if (!proposal.value) return;

  return getVotingPower(props.space, proposal.value);
});

const votingPowerDecimals = computed(() => {
  if (!proposal.value) return 0;
  return Math.max(
    ...proposal.value.space.strategies_parsed_metadata.map(
      metadata => metadata.decimals
    ),
    0
  );
});

const currentVote = computed(
  () =>
    proposal.value &&
    votes.value[`${proposal.value.network}:${proposal.value.id}`]
);

const withoutBottomPadding = computed(
  () => 'space-proposal-votes' === String(route.name)
);

async function handleVoteClick(choice: Choice) {
  if (!web3.value.account) {
    modalAccountOpen.value = true;
    return;
  }

  selectedChoice.value = choice;

  if (props.space.terms && !termsStore.areAccepted(props.space)) {
    modalOpenTerms.value = true;
    return;
  }

  modalOpenVote.value = true;
}

function handleAcceptTerms() {
  termsStore.accept(props.space);
  handleVoteClick(selectedChoice.value!);
}

async function handleVoteSubmitted() {
  selectedChoice.value = null;
  editMode.value = false;
}

function handleFetchVotingPower() {
  if (!proposal.value) return;

  fetchVotingPower(props.space, proposal.value);
}

watch(
  [proposal, () => web3.value.account, () => web3.value.authLoading],
  ([toProposal, toAccount, toAuthLoading], [, fromAccount]) => {
    if (fromAccount && toAccount && fromAccount !== toAccount) {
      resetVotingPower();
    }

    if (toAuthLoading || !toProposal || !toAccount) return;

    handleFetchVotingPower();
  },
  { immediate: true }
);

watch(
  id,
  async id => {
    modalOpenVote.value = false;
    editMode.value = false;
    await proposalsStore.fetchProposal(props.space.id, id, props.space.network);

    if (discussion.value) {
      loadSingleTopic(discussion.value).then(result => {
        discourseTopic.value = result;
      });
    }

    if (props.space.additionalRawData?.boost?.enabled) {
      const bribeEnabled =
        props.space.additionalRawData.boost.bribeEnabled || false;
      const proposalEnd = proposal.value?.max_end || 0;
      getBoostsCount(id, bribeEnabled, proposalEnd).then(result => {
        boostCount.value = result;
      });
    }
  },
  { immediate: true }
);

watchEffect(() => {
  if (!proposal.value) return;

  setTitle(proposal.value.title || `Proposal #${proposal.value.proposal_id}`);
});
</script>

<template>
  <div
    :class="[
      'flex items-stretch md:flex-row flex-col w-full md:h-full',
      { '!pb-0': withoutBottomPadding }
    ]"
  >
    <UiLoading v-if="!proposal" class="ml-4 mt-3" />
    <template v-else>
      <div class="flex-1 grow min-w-0">
        <UiScrollerHorizontal with-buttons gradient="xxl" :sticky-offset="72">
          <div class="flex px-4 bg-skin-bg border-b space-x-3 min-w-max">
            <AppLink
              :to="{
                name: 'space-proposal-overview',
                params: {
                  proposal: proposal.proposal_id,
                  space: `${proposal.network}:${proposal.space.id}`
                }
              }"
            >
              <UiLink
                :is-active="route.name === 'space-proposal-overview'"
                text="Overview"
              />
            </AppLink>
            <AppLink
              :to="{
                name: 'space-proposal-votes',
                params: {
                  proposal: proposal.proposal_id,
                  space: `${proposal.network}:${proposal.space.id}`
                }
              }"
              class="flex items-center"
            >
              <UiLink
                :is-active="route.name === 'space-proposal-votes'"
                :count="proposal.vote_count"
                text="Votes"
                class="inline-block"
              />
            </AppLink>
            <template v-if="discussion">
              <AppLink
                v-if="discourseTopic?.posts_count"
                :to="{
                  name: 'space-proposal-discussion',
                  params: {
                    proposal: proposal.proposal_id,
                    space: `${proposal.network}:${proposal.space.id}`
                  }
                }"
                class="flex items-center"
              >
                <UiLink
                  :is-active="route.name === 'space-proposal-discussion'"
                  :count="discourseTopic.posts_count"
                  text="Discussion"
                  class="inline-block"
                />
              </AppLink>
              <a
                v-else
                :href="discussion"
                target="_blank"
                class="flex items-center"
              >
                <h4 class="eyebrow text-skin-text" v-text="'Discussion'" />
                <IH-arrow-sm-right class="-rotate-45 text-skin-text" />
              </a>
            </template>
            <template v-if="boostCount > 0">
              <a
                :href="`https://v1.snapshot.box/#/${proposal.space.id}/proposal/${proposal.proposal_id}`"
                class="flex items-center"
                target="_blank"
              >
                <UiLink :count="boostCount" text="Boost" class="inline-block" />
              </a>
            </template>
          </div>
        </UiScrollerHorizontal>
        <router-view :proposal="proposal" />
      </div>
      <Affix
        :class="[
          'shrink-0 md:w-[340px] border-l-0 md:border-l',
          {
            'hidden md:block': route.name === 'space-proposal-votes',
            '-mb-6': !withoutBottomPadding
          }
        ]"
        :top="72"
        :bottom="64"
      >
        <div class="flex flex-col space-y-4 p-4">
          <div
            v-if="
              !proposal.cancelled &&
              ['pending', 'active'].includes(proposal.state)
            "
          >
            <h4 class="mb-2.5 eyebrow flex items-center space-x-2">
              <template v-if="editMode">
                <IH-cursor-click />
                <span>Edit your vote</span>
              </template>
              <template v-else-if="currentVote">
                <IH-check-circle />
                <span>Your vote</span>
              </template>
              <template v-else>
                <IH-cursor-click />
                <span>Cast your vote</span>
              </template>
            </h4>
            <div class="space-y-2">
              <IndicatorVotingPower
                v-if="web3.account && (!currentVote || editMode)"
                v-slot="votingPowerProps"
                :network-id="proposal.network"
                :voting-power="votingPower"
                class="mb-2 flex items-center"
                @fetch-voting-power="handleFetchVotingPower"
              >
                <div
                  v-if="
                    votingPower?.error &&
                    votingPower.error.details === 'NOT_READY_YET' &&
                    ['evmSlotValue', 'ozVotesStorageProof'].includes(
                      votingPower.error.source
                    )
                  "
                >
                  <span class="inline-flex align-top h-[27px] items-center">
                    <IH-exclamation-circle class="mr-1" />
                  </span>
                  Please allow few minutes for the voting power to be collected
                  from Ethereum.
                </div>
                <div v-else class="flex gap-1.5 items-center">
                  <span class="shrink-0">Voting power:</span>
                  <button
                    type="button"
                    class="truncate"
                    @click="votingPowerProps.onClick"
                  >
                    <UiLoading
                      v-if="!votingPower || votingPower.status === 'loading'"
                    />
                    <IH-exclamation
                      v-else-if="votingPower.status === 'error'"
                      class="inline-block text-rose-500"
                    />
                    <span
                      v-else
                      class="text-skin-link"
                      v-text="getFormattedVotingPower(votingPower)"
                    />
                  </button>
                  <a
                    v-if="
                      votingPower?.status === 'success' &&
                      votingPower.totalVotingPower === BigInt(0)
                    "
                    :href="`${HELPDESK_URL}/en/articles/9566904-why-do-i-have-0-voting-power`"
                    target="_blank"
                  >
                    <IH-question-mark-circle />
                  </a>
                </div>
              </IndicatorVotingPower>
              <ProposalVote
                v-if="proposal"
                :proposal="proposal"
                :edit-mode="editMode"
                @enter-edit-mode="editMode = true"
              >
                <ProposalVoteBasic
                  v-if="proposal.type === 'basic'"
                  :choices="proposal.choices"
                  @vote="handleVoteClick"
                />
                <ProposalVoteSingleChoice
                  v-else-if="proposal.type === 'single-choice'"
                  :proposal="proposal"
                  :default-choice="currentVote?.choice"
                  @vote="handleVoteClick"
                />
                <ProposalVoteApproval
                  v-else-if="proposal.type === 'approval'"
                  :proposal="proposal"
                  :default-choice="currentVote?.choice"
                  @vote="handleVoteClick"
                />
                <ProposalVoteRankedChoice
                  v-else-if="proposal.type === 'ranked-choice'"
                  :proposal="proposal"
                  :default-choice="currentVote?.choice"
                  @vote="handleVoteClick"
                />
                <ProposalVoteWeighted
                  v-else-if="['weighted', 'quadratic'].includes(proposal.type)"
                  :proposal="proposal"
                  :default-choice="currentVote?.choice"
                  @vote="handleVoteClick"
                />
              </ProposalVote>
            </div>
          </div>
          <div
            v-if="
              !proposal.cancelled &&
              proposal.state !== 'pending' &&
              proposal.vote_count
            "
          >
            <h4 class="mb-2.5 eyebrow flex items-center gap-2">
              <IH-chart-square-bar />
              Results
            </h4>
            <ProposalResults
              with-details
              :proposal="proposal"
              :decimals="votingPowerDecimals"
            />
          </div>
          <div v-if="space.labels?.length && proposal.labels?.length">
            <h4 class="mb-2.5 eyebrow flex items-center gap-2">
              <IH-tag />
              Labels
            </h4>
            <ProposalLabels
              :labels="proposal.labels"
              :space="space"
              with-link
            />
          </div>
          <div>
            <h4 class="mb-2.5 eyebrow flex items-center gap-2">
              <IH-clock />
              Timeline
            </h4>
            <ProposalTimeline :data="proposal" />
          </div>
        </div>
        <ModalTerms
          v-if="space.terms"
          :open="modalOpenTerms"
          :space="space"
          @close="modalOpenTerms = false"
          @accept="handleAcceptTerms"
        />
        <ModalVote
          v-if="proposal"
          :choice="selectedChoice"
          :proposal="proposal"
          :open="modalOpenVote"
          @close="modalOpenVote = false"
          @voted="handleVoteSubmitted"
        />
      </Affix>
    </template>
    <teleport to="#modal"> </teleport>
  </div>
</template>
