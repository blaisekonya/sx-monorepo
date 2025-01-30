<script setup lang="ts">
import { ProposalState } from '@/types';

const titles: Record<ProposalState, string> = {
  pending: 'Pending',
  active: 'Active',
  passed: 'Passed',
  rejected: 'Rejected',
  executed: 'Executed',
  closed: 'Closed'
};

const props = withDefaults(
  defineProps<{
    size?: number | string;
    state: ProposalState;
  }>(),
  {
    size: 24
  }
);

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`
}));
</script>

<template>
  <UiTooltip :title="titles[state]">
    <IS-clock
      v-if="state === 'pending'"
      class="text-gray-400 bg-skin-bg rounded-full border-[1px] border-skin-bg"
      :style="style"
    />
    <IS-status-online
      v-else-if="state === 'active'"
      class="text-skin-success bg-skin-bg rounded-full border-2 border-skin-bg"
      :style="style"
    />
    <IS-minus-circle
      v-else-if="state === 'closed'"
      class="text-skin-link bg-skin-bg rounded-full border-[1px] border-skin-bg"
      :style="style"
    />
    <IS-check-circle
      v-else-if="state === 'passed'"
      class="text-skin-link bg-skin-bg rounded-full border-[1px] border-skin-bg"
      :style="style"
    />
    <IS-play
      v-else-if="state === 'executed'"
      class="text-purple-500 bg-skin-bg rounded-full border-2 border-skin-bg"
      :style="style"
    />
    <IS-x-circle
      v-else-if="state === 'rejected'"
      class="text-skin-danger bg-skin-bg rounded-full border-[1px] border-skin-bg"
      :style="style"
    />
  </UiTooltip>
</template>
