<script setup lang="ts">
const { isVisible, isMobile } = useScrollVisibility();
</script>

<template>
  <header
    class="fixed top-0 inset-x-0 z-50 border-b flex items-center justify-between h-[72px] bg-skin-bg transition-transform duration-200"
    :class="{ '-translate-y-full': !isVisible && isMobile }">
    <slot />
  </header>
</template>
