<script setup lang="ts">
import ICGitHub from '~icons/c/github';
import ISGlobe from '~icons/heroicons-solid/globe';
import ISBanknotes from '~icons/heroicons-solid/banknotes';
import ISCursorClick from '~icons/heroicons-solid/cursor-click';
import ISLightBulb from '~icons/heroicons-solid/light-bulb';
import ISUserGroup from '~icons/heroicons-solid/user-group';

const FEATURES = [
  {
    title: 'A bold vision',
    about:
      'We experiment with new forms of governance to inspire and build the systems of the future.',
    icon: ISLightBulb
  },
  {
    title: 'Open membership',
    about:
      'Anyone, anywhere can join and participate, ensuring inclusivity and diversity.',
    icon: ISUserGroup
  },
  {
    title: 'Economic freedom',
    about:
      'The world drachma funds initiatives, supports members, and enables financial indepence.',
    icon: ISBanknotes
  },
  {
    title: 'Digital democracy',
    about:
      'Everyone has an equal opportunity to participate in decisions about our shared future.',
    icon: ISCursorClick
  },
  {
    title: 'Radical transparency',
    about:
      'Rooted in open source principles to guarantee full accountability and capture-resistance.',
    icon: ICGitHub
  },
  {
    title: 'Cloud to ground',
    about:
      "Starting in the digital space, we aim to create physical hubs united by shared values.",
    icon: ISGlobe
  },
];
</script>

<template>
  <div id="features" class="pt-8 border-b">
    <UiContainer class="!max-w-screen-lg">
      <div class="pb-6 max-w-[640px]">
        <h1 class="mb-4 font-display text-[36px] xs:text-[44px]">
          A global community, built together on shared values
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
