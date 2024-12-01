<script setup lang="ts">
import ICGitHub from '~icons/c/github';
import ISGlobe from '~icons/heroicons-solid/globe';
import ISBanknotes from '~icons/heroicons-solid/banknotes';
import ISCursorClick from '~icons/heroicons-solid/cursor-click';
import ISShieldCheck from '~icons/heroicons-solid/shield-check';
import ISUserGroup from '~icons/heroicons-solid/user-group';

const FEATURES = [
  {
    title: 'Democratic decisions',
    about:
      'Using proof of personhood methods to ensure that every voice is real, unique, and counts equally.',
    icon: ISUserGroup
  },
  {
    title: 'Radical transparency',
    about:
      'Rooted in open source principles to guarantee full accountability and capture-resistance.',
    icon: ICGitHub
  },
  {
    title: 'Guided by subsidiarity',
    about:
      'Focusing exclusively on issues where global coordination is the most effective approach.',
    icon: ISGlobe
  },
  {
    title: 'Secure, flexible voting',
    about:
      'Encrypted, adaptable voting systems to protect privacy and suit diverse decision-making needs.',
    icon: ISShieldCheck
  },
  {
    title: 'Financial self-reliance',
    about:
      "Powered by the world drachma, we support initiatives without depending on external donations.",
    icon: ISBanknotes
  },
  {
    title: 'Empowered advocacy',
    about:
      'Providing free tools to drive global change with democratic polls, petitions, and open letters.',
    icon: ISCursorClick
  }
];
</script>

<template>
  <div id="features" class="pt-8 border-b">
    <UiContainer class="!max-w-screen-lg">
      <div class="pb-6 max-w-[440px]">
        <h1 class="mb-4 font-display !text-[36px] sm:!text-[44px]">
          The future of global governance
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
