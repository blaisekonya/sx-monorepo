<script setup lang="ts">
import { Topic } from '@/helpers/discourse';
import { useScrollVisibility } from '@/composables/useScrollVisibility';

defineProps<{
  title?: string;
  loading?: boolean;
  topics: Topic[];
}>();

const { isVisible, isMobile } = useScrollVisibility();

const stickyHeaderClass = computed(() => {
  if (!isMobile.value) return 'top-[72px]';
  return isVisible.value ? 'top-[72px]' : 'top-0';
});
</script>

<template>
  <div>
    <UiLabel v-if="title" :label="title" :sticky-offset="72" class="transition-[top] duration-200"
      :class="stickyHeaderClass" />
    <UiLoading v-if="loading" class="block px-4 py-3" />
    <div v-else>
      <TopicsListItem v-for="(topic, i) in topics" :key="i" :topic="topic" />
      <div v-if="!topics.length" class="px-4 py-3 flex items-center space-x-2 text-skin-link">
        <IH-exclamation-circle class="shrink-0" />
        <span v-text="'There are no topics here.'" />
      </div>
    </div>
  </div>
</template>
