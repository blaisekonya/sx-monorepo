<script setup lang="ts">
import ICGitHub from '~icons/c/github';
import ISAdjustments from '~icons/heroicons-solid/adjustments';
import ISBanknotes from '~icons/heroicons-solid/banknotes';
import ISCursorClick from '~icons/heroicons-solid/cursor-click';
import ISShieldCheck from '~icons/heroicons-solid/shield-check';
import ISUserGroup from '~icons/heroicons-solid/user-group';

const FEATURES = [
  {
    title: 'Democratic legitimacy',
    about:
      'Using different proof of personhood methods, we verify that all our members are real and unique humans.',
    icon: ISUserGroup
  },
  {
    title: 'Sustainable funding',
    about:
      "The world drachma supports the community and eliminates our need to rely on charity.",
    icon: ISBanknotes
  },
  {
    title: 'Radical transparency',
    about:
      'Accountability and capture-resistance ensured by our transparent operations and open-source approach.',
    icon: ICGitHub
  },
  {
    title: 'Flexible voting systems',
    about:
      'Supporting various voting protocols and choosing the most suitable one for each decision.',
    icon: ISAdjustments
  },
  {
    title: 'Empowered advocacy',
    about:
      'We provide free tools for polls, petitions, and open letters to mobilize communities like never before.',
    icon: ISCursorClick
  },
  {
    title: 'Secure voting',
    about:
      'Voter choices are encrypted until voting ends, preventing manipulation and promoting fair outcomes.',
    icon: ISShieldCheck
  }
];
</script>

<template>
  <div id="features" class="pt-8 border-b">
    <UiContainer class="!max-w-screen-lg">
      <div class="pb-6 max-w-[600px]">
        <h1 class="mb-4 font-display !text-[36px] sm:!text-[44px]">
          All we need to decentralize global governance
        </h1>
      </div>
    </UiContainer>
    <div class="border-t">
      <UiContainer class="!max-w-screen-lg !px-0">
        <div class="grid grid-cols-1 text-[18px] lg:grid-cols-3">
          <div v-for="(feature, i) in FEATURES" :key="i"
            class="px-4 py-5 border-b last:border-b-0 border-r-0 lg:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(n+4)]:border-b-0">
            <component :is="feature.icon" class="text-skin-link size-[22px] mb-4" />
            <h3 class="text-skin-link font-heading !text-[18px] mb-2" v-text="feature.title" />
            <div v-text="feature.about" />
          </div>
        </div>
      </UiContainer>
    </div>
  </div>
</template>
