<script lang="ts" setup>
const { resolved: whiteLabelResolved, failed } = useWhiteLabel();
const { setAppName } = useApp();
const router = useRouter();

function handleReloadClick() {
  window.location.reload();
}

watch(
  whiteLabelResolved,
  resolved => {
    if (!resolved || failed.value) return;

    router.replace(router.currentRoute.value.fullPath);
  },
  { immediate: true }
);

onMounted(() => {
  setAppName(null);
});
</script>

<template>
  <div class="flex flex-col justify-center items-center h-screen gap-5">
    <div
      class="box-border h-[120px] w-[120px] rounded-full border-[20px] border-skin-border"
      :class="{ 'animate-pulse': !failed }"
    ></div>
    <div v-if="failed" class="text-center space-y-3">
      <div class="text-skin-text">Error while loading the app</div>
      <UiButton class="!text-skin-text" @click="handleReloadClick">
        Try again
      </UiButton>
    </div>
  </div>
</template>
