<template>
  <div class="fixed bottom-8 xs:bottom-[28px] right-4 xs:right-11 space-y-2">
    <div
      v-for="(toast, index) in toasts"
      :key="index"
      :class="[
        'px-3 py-2 rounded shadow-lg',
        toast.type === 'success'
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      ]"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast';

const { toasts } = useToast();
</script>
