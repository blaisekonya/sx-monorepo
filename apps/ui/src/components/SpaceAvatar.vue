<script setup lang="ts">
import { getCacheHash } from '@/helpers/utils';
import { NetworkID } from '@/types';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    space: {
      id: string;
      avatar: string;
      network: NetworkID;
      active_proposals: number | null;
    };
    size: number;
    showActiveProposals?: boolean;
  }>(),
  {
    size: 22,
    showActiveProposals: false
  }
);

const cb = computed(() => getCacheHash(props.space.avatar));
</script>

<template>
  <UiStamp
    :id="`${space.network}:${space.id}`"
    :size="size"
    :cb="cb"
    class="!bg-skin-bg"
    type="space"
  />
</template>
