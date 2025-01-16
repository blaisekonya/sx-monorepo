<script setup lang="ts">
import { formatQuorum, quorumLabel, quorumProgress } from '@/helpers/quorum';
import { _n, _rt, shortenAddress } from '@/helpers/utils';
import { Proposal as ProposalType } from '@/types';
import SpaceAvatar from './SpaceAvatar.vue';

const props = withDefaults(
  defineProps<{
    proposal: ProposalType;
    showSpace?: boolean;
    showAuthor?: boolean;
    showVotedIndicator?: boolean;
  }>(),
  {
    showSpace: true,
    showAuthor: true,
    showVotedIndicator: true
  }
);

const { getTsFromCurrent } = useMetaStore();
const spacesStore = useSpacesStore();
const { votes } = useAccount();
const modalOpenTimeline = ref(false);

const totalProgress = computed(() => quorumProgress(props.proposal));
const space = computed(() =>
  spacesStore.spacesMap.get(
    `${props.proposal.network}:${props.proposal.space.id}`
  )
);
</script>
<template>
  <div v-bind="$attrs">
    <div class="space-x-2 flex">
      <div class="flex flex-shrink-0">
        <SpaceAvatar
          v-if="$route.path === '/home'"
          :space="{
            id: proposal.space.id,
            avatar: proposal.space.avatar,
            network: proposal.network,
            active_proposals: null
          }"
          :size="40"
          class="my-1"
        />
        <AppLink
          :to="{
            name: 'space-proposal-overview',
            params: {
              proposal: proposal.proposal_id,
              space: `${proposal.network}:${proposal.space.id}`
            }
          }"
          :class="
            $route.path === '/home'
              ? 'relative top-[26px] right-[14px] -mr-[16px] md:-mr-[12px]'
              : 'relative -top-[1px]'
          "
        >
          <ProposalIconStatus size="18" :state="proposal.state" class="top-1" />
        </AppLink>
      </div>
      <div class="flex flex-col min-w-0 leading-6">
        <AppLink
          v-if="showSpace"
          :to="{
            name: 'space-overview',
            params: {
              space: `${proposal.network}:${proposal.space.id}`
            }
          }"
          class="text-[18px] font-bold inline shrink-0"
        >
          {{ proposal.space.name }}
        </AppLink>

        <AppLink
          :to="{
            name: 'space-proposal-overview',
            params: {
              proposal: proposal.proposal_id,
              space: `${proposal.network}:${proposal.space.id}`
            }
          }"
          class="!leading-[22px]"
        >
          <h3
            class="text-[18px] font-normal inline [overflow-wrap:anywhere] min-w-0"
            v-text="proposal.title || `Proposal #${proposal.proposal_id}`"
          />
          <ProposalLabels
            v-if="space?.labels && proposal.labels.length"
            :labels="proposal.labels"
            :space="space"
            inline
            with-link
            class="ml-1"
          />
          <IH-check
            v-if="
              showVotedIndicator && votes[`${proposal.network}:${proposal.id}`]
            "
            class="text-skin-success inline-block shrink-0 relative ml-0.5 mb-0.5"
          />
        </AppLink>

        <div
          class="mt-0.5 text-sm flex flex-wrap items-center leading-[18px] gap-x-1 gap-y-0.5"
        >
          <template v-if="showAuthor">
            <span>By</span>
            <AppLink
              class="text-skin-text"
              :to="{
                name: 'space-user-statement',
                params: {
                  space: `${proposal.network}:${proposal.space.id}`,
                  user: proposal.author.id
                }
              }"
            >
              {{ proposal.author.name || shortenAddress(proposal.author.id) }}
            </AppLink>
          </template>
          <template v-if="proposal.vote_count">
            <span>·</span>
            <span
              >{{ _n(proposal.vote_count, 'compact') }}
              <span v-if="proposal.vote_count !== 1">{{
                proposal.vote_count !== 1 ? 'votes' : 'vote'
              }}</span>
            </span>
          </template>
          <template v-if="proposal.quorum">
            <span>·</span>
            <span class="lowercase">
              {{ formatQuorum(totalProgress) }}
              {{ quorumLabel(proposal.quorum_type) }}
            </span>
          </template>
          <span>·</span>
          <button
            type="button"
            class="text-skin-text"
            @click="modalOpenTimeline = true"
            v-text="_rt(getTsFromCurrent(proposal.network, proposal.max_end))"
          />
        </div>
      </div>
    </div>
  </div>
  <teleport to="#modal">
    <ModalTimeline
      :open="modalOpenTimeline"
      :proposal="proposal"
      @close="modalOpenTimeline = false"
    />
  </teleport>
</template>
