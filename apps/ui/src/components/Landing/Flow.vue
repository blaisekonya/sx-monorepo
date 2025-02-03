<script setup lang="ts">
import ISBuildingLibrary from '~icons/heroicons-solid/building-library';
import ISUserPlus from '~icons/heroicons-solid/user-plus';

const STEPS = [
  {
    title: 'Join',
    about:
      'Be part of a community pioneering the new era of democracy - borderless, transparent, unstoppable.',
    icon: ISUserPlus
  },
  {
    title: 'Govern',
    about:
      'Influence solutions to humanity’s most pressing global challenges, from climate action to AI governance.',
    icon: ISBuildingLibrary
  }
];
</script>

<template>
  <div id="community" class="pt-8">
    <UiContainer class="!max-w-screen-lg">
      <div class="pb-6 max-w-[800px] text-center mx-auto">
        <h1 class="mb-4 font-display text-[36px] xs:text-[44px]">
          It's time for global democracy
        </h1>
      </div>
    </UiContainer>
    <div class="border-y">
      <UiContainer class="!max-w-screen-lg !px-0">
        <div class="grid grid-cols-1 lg:grid-cols-2 text-[19px] flow">
          <div
            v-for="(step, i) in STEPS"
            :key="i"
            class="border-b border-r-0 last:border-b-0 lg:border-r lg:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(n+1)]:border-b-0"
          >
            <div class="px-4 py-5">
              <div class="flex space-x-2.5">
                <component
                  :is="step.icon"
                  class="text-skin-link size-[24px] mb-4 inline-block"
                />
                <h2
                  class="mb-3 font-heading text-[22px] inline-block"
                  v-text="step.title"
                />
              </div>
              <div class="mb-3 max-w-[457px]">
                <div
                  class="bg-contain flow w-full max-h-[260px] h-[calc(50vw)]"
                  :class="`step-${i + 1}`"
                />
              </div>
              <div v-text="step.about" />
            </div>
          </div>
        </div>
      </UiContainer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flow {
  .step-1 {
    background-image: url('@/assets/site/flow-1-light.png');
  }

  .step-2 {
    background-image: url('@/assets/site/flow-2-light.png');
  }
}

.dark {
  .flow {
    .step-1,
    .step-2 {
      filter: contrast(1.2) brightness(0.95);
    }

    .step-1 {
      background-image: url('@/assets/site/flow-1-dark.png');
    }

    .step-2 {
      background-image: url('@/assets/site/flow-2-dark.png');
    }
  }
}
</style>
