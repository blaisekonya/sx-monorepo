<script setup lang="ts">
import { APP_NAME } from '@/helpers/constants';

useTitle(APP_NAME);
</script>

<template>
  <div class="relative">
    <LandingHero />
    <LandingFlow />
    <LandingFeatures />
    <LandingStart />
  </div>
</template>
