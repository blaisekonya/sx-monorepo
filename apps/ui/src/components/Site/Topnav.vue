<script setup lang="ts">
const { toggleSkin, currentMode } = useUserSkin();
</script>

<template>
  <div
    class="p-4 lg:px-6 flex justify-center items-center absolute z-10 left-0 right-0"
  >
    <div class="grow flex items-center">
      <AppLink :to="{ name: 'site-landing' }" class="inline-block">
        <div class="flex justify-center items-center">
          <div
            class="box-border h-[36px] w-[36px] rounded-full border-[6px] border-skin-primary"
          ></div>
          <!-- <span class="text-[26px] font-display tracking-tight ml-2">World Republic</span> -->
        </div>
      </AppLink>
    </div>
    <div class="shrink-0 space-x-3 items-center flex">
      <UiButton class="!px-0 w-[46px]" @click="toggleSkin">
        <IH-light-bulb v-if="currentMode === 'dark'" class="inline-block" />
        <IH-moon v-else class="inline-block" />
      </UiButton>
      <UiButton
        :to="'https://world.org/mini-app?app_id=app_66c83ab8c851fb1e54b1b1b62c6ce39d'"
        target="_blank"
        rel="noopener noreferrer"
        class="primary"
      >
        Launch app
      </UiButton>
    </div>
  </div>
</template>
