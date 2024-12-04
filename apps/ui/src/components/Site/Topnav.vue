<script setup lang="ts">
const { toggleSkin, currentMode } = useUserSkin();
</script>

<template>
  <div class="p-4 lg:px-6 flex justify-center items-center absolute z-10 left-0 right-0">
    <div class="grow flex items-center">
      <AppLink :to="{ name: 'site-landing' }" class="inline-block">
        <div class="flex justify-center items-center">
          <div class="box-border h-[36px] w-[36px] rounded-full border-[6px] border-skin-primary"></div>
        </div>
      </AppLink>
    </div>
    <ul class="hidden lg:flex text-md text-skin-link space-x-4 mr-6">
      <li>
        <a href="https://github.com/worldassociation/constitution" target="_blank">
          Constitution
          <IH-arrow-sm-right class="inline-block -ml-0.5 mb-0.5 -rotate-45" />
        </a>
      </li>
    </ul>
    <div class="shrink-0 space-x-3 items-center flex">
      <UiButton class="!px-0 w-[46px]" @click="toggleSkin">
        <IH-light-bulb v-if="currentMode === 'dark'" class="inline-block" />
        <IH-moon v-else class="inline-block" />
      </UiButton>
      <UiButton :to="{ name: 'my-home' }" class="primary">
        Launch
        <span class="hidden md:inline-block">&nbsp;app</span>
      </UiButton>
    </div>
  </div>
</template>
