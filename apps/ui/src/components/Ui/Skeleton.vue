<script setup lang="ts">
withDefaults(
  defineProps<{
    className?: string;
  }>(),
  {
    className: ''
  }
);
</script>

<template>
  <div :class="['animate-pulse rounded-md bg-skin-border/50', className]" />
</template>
