<script setup lang="ts">
import ISBanknotes from '~icons/heroicons-solid/banknotes';
import ISCursorClick from '~icons/heroicons-solid/cursor-click';
import ISIdentification from '~icons/heroicons-solid/identification';

const FEATURES = [
  {
    title: 'World Republic App',
    about: 'A fork of Snapshot with global democracy features built in.',
    icon: ISCursorClick
  },
  {
    title: 'Global Voter ID',
    about: 'Governance SBT secured by zkMe’s anti-sybil verification.',
    icon: ISIdentification
  },
  {
    title: 'World Drachma',
    about: 'The first currency democratically managed by humanity.',
    icon: ISBanknotes
  }
];
</script>

<template>
  <div id="features" class="pt-8 border-b">
    <UiContainer class="!max-w-screen-lg">
      <div class="pb-6 max-w-[800px]">
        <h1 class="mb-4 font-display text-[36px] xs:text-[44px]">
          Current projects
        </h1>
      </div>
    </UiContainer>
    <div class="border-t">
      <UiContainer class="!max-w-screen-lg !px-0">
        <div class="grid grid-cols-1 text-[18px] lg:grid-cols-3">
          <div
            v-for="(feature, i) in FEATURES"
            :key="i"
            class="px-4 py-5 border-b last:border-b-0 border-r-0 lg:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(n+1)]:border-b-0"
          >
            <component
              :is="feature.icon"
              class="text-skin-link size-[22px] mb-4"
            />
            <h3
              class="text-skin-link font-heading !text-[18px] mb-2"
              v-text="feature.title"
            />
            <div v-text="feature.about" />
          </div>
        </div>
      </UiContainer>
    </div>
  </div>
</template>
