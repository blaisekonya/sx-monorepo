<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  open: boolean;
  streamUrl: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isLoading = ref(true);

// Add watch to reset loading state when modal opens
watch(
  () => props.open,
  newValue => {
    if (newValue) {
      isLoading.value = true;
    }
  }
);

const handleIframeLoad = () => {
  isLoading.value = false;
};
</script>

<template>
  <UiModal :open="open" class="max-w-3xl" @close="$emit('close')">
    <template #header>
      <h3>Basic Income Stream</h3>
    </template>
    <div class="relative w-full h-[calc(100vh-161px)] md:h-[45vh]">
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center"
      >
        <UiLoading :size="20" />
      </div>
      <div class="absolute inset-0">
        <iframe
          :src="streamUrl"
          class="w-full h-full"
          frameborder="0"
          @load="handleIframeLoad"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex justify-between items-center w-full">
        <UiButton @click="$emit('close')"> Close </UiButton>
        <a
          :href="streamUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-skin-text hover:text-skin-link"
        >
          <UiButton variant="ghost">
            Open in new tab
            <IH-arrow-sm-right
              class="inline-block -rotate-45 mb-[1px] ml-[2px]"
            />
          </UiButton>
        </a>
      </div>
    </template>
  </UiModal>
</template>
