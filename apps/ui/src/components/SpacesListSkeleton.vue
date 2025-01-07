<script setup lang="ts">
withDefaults(
  defineProps<{
    count?: number;
  }>(),
  {
    count: 15
  }
);
</script>

<template>
  <div
    class="justify-center max-w-screen-md 2xl:max-w-screen-xl 3xl:max-w-screen-2xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-explore-3 2xl:grid-cols-explore-4 3xl:grid-cols-explore-5 gap-3"
  >
    <div
      v-for="i in count"
      :key="i"
      class="text-skin-text border rounded-lg block relative overflow-hidden h-[280px]"
    >
      <!-- Cover image -->
      <div class="h-[68px] w-full absolute overflow-hidden">
        <UiSkeleton class="h-full w-full" />
      </div>

      <!-- Avatar -->
      <div class="relative inline-block mx-4 mt-[34px]">
        <div class="mb-1.5">
          <UiSkeleton
            class="border-skin-bg rounded-md border-[3px] size-[50px]"
          />
        </div>
      </div>

      <!-- Content -->
      <div class="px-4">
        <div class="flex items-center">
          <!-- Space name -->
          <UiSkeleton
            :class="[
              'h-[20px] mb-1',
              i % 3 === 0 ? 'w-[128px]' : i % 3 === 1 ? 'w-[100px]' : 'w-[80px]'
            ]"
          />
          <!-- Badge placeholder -->
          <UiSkeleton class="h-[20px] w-[20px] mb-1 ml-1 !rounded-full" />
        </div>

        <!-- About section -->
        <div class="mt-2.5">
          <UiSkeleton class="h-[18px] w-full mb-1" />
          <UiSkeleton
            :class="[
              'h-[18px] mb-1',
              i % 3 === 0 ? 'w-11/12' : i % 3 === 1 ? 'w-10/12' : 'w-9/12'
            ]"
          />
          <UiSkeleton
            :class="[
              'h-[18px]',
              i % 3 === 0 ? 'w-4/5' : i % 3 === 1 ? 'w-3/5' : 'w-2/5'
            ]"
          />
        </div>
      </div>

      <!-- Stats -->
      <div class="absolute bottom-[28px] px-4 flex items-center space-x-2">
        <UiSkeleton
          :class="[
            'h-[16px]',
            i % 3 === 0 ? 'w-[80px]' : i % 3 === 1 ? 'w-[70px]' : 'w-[60px]'
          ]"
        />
        <UiSkeleton
          :class="[
            'h-[16px]',
            i % 3 === 0 ? 'w-[60px]' : i % 3 === 1 ? 'w-[50px]' : 'w-[40px]'
          ]"
        />
      </div>
    </div>
  </div>
</template>
