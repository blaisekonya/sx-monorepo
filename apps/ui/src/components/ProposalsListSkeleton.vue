<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    count?: number;
    isHome?: boolean;
  }>(),
  {
    count: 3,
    isHome: false
  }
);
</script>

<template>
  <div class="animate-pulse">
    <div v-for="i in count" :key="i">
      <div class="border-b mx-3 sm:mx-4 py-[9px] flex">
        <div class="flex-auto mr-1 w-0">
          <div class="space-x-2 flex">
            <div class="flex flex-shrink-0">
              <div
                v-if="isHome"
                class="my-1 bg-skin-border rounded-full w-[40px] h-[40px]"
              />
              <div
                :class="[
                  'rounded-full bg-skin-border',
                  isHome
                    ? 'relative top-[30px] right-[13px] -mr-[16px] md:-mr-[12px] w-[18px] h-[18px]'
                    : 'relative top-[3px] w-[18px] h-[18px]'
                ]"
              />
            </div>

            <div class="flex flex-col min-w-0 mt-1 leading-6">
              <div
                v-if="isHome"
                class="font-bold h-[20px] w-[120px] bg-skin-border rounded mb-1"
              />

              <div
                class="block md:hidden h-[19px] w-11/12 bg-skin-border rounded mb-1"
              />

              <div
                class="h-[19px] w-1/2 md:w-[384px] bg-skin-border rounded mb-2"
              />

              <div class="flex items-center gap-1 mb-[3px]">
                <div class="h-3 w-[100px] bg-skin-border rounded" />
                <div class="h-3 w-[60px] bg-skin-border rounded" />
                <div class="h-3 w-[80px] bg-skin-border rounded" />
                <div class="h-3 w-[60px] bg-skin-border rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="border-b mx-3 sm:mx-4 py-[11px] flex">
        <div class="flex-auto mr-1 w-0">
          <div class="space-x-2 flex">
            <div class="flex flex-shrink-0">
              <div
                v-if="isHome"
                class="my-1 bg-skin-border rounded-full w-[40px] h-[40px]"
              />
              <div
                :class="[
                  'rounded-full bg-skin-border',
                  isHome
                    ? 'relative top-[30px] right-[13px] -mr-[16px] md:-mr-[12px] w-[18px] h-[18px]'
                    : 'relative top-[3px] w-[18px] h-[18px]'
                ]"
              />
            </div>

            <div class="flex flex-col min-w-0 mt-1 leading-6">
              <div
                v-if="isHome"
                class="font-bold h-[20px] w-[80px] bg-skin-border rounded mb-1"
              />

              <div
                class="block md:hidden h-[19px] w-9/12 bg-skin-border rounded mb-1"
              />

              <div
                class="h-[19px] w-1/2 md:w-[256px] bg-skin-border rounded mb-2"
              />

              <div class="flex items-center gap-1 mb-[3px]">
                <div class="h-3 w-[64px] bg-skin-border rounded" />
                <div class="h-3 w-[60px] bg-skin-border rounded" />
                <div class="h-3 w-[80px] bg-skin-border rounded" />
                <div class="h-3 w-[60px] bg-skin-border rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="border-b mx-3 sm:mx-4 py-[11px] flex">
        <div class="flex-auto mr-1 w-0">
          <div class="space-x-2 flex">
            <div class="flex flex-shrink-0">
              <div
                v-if="isHome"
                class="my-1 bg-skin-border rounded-full w-[40px] h-[40px]"
              />
              <div
                :class="[
                  'rounded-full bg-skin-border',
                  isHome
                    ? 'relative top-[30px] right-[13px] -mr-[16px] md:-mr-[12px] w-[18px] h-[18px]'
                    : 'relative top-[3px] w-[18px] h-[18px]'
                ]"
              />
            </div>

            <div class="flex flex-col min-w-0 mt-1 leading-6">
              <div
                v-if="isHome"
                class="font-bold h-[20px] w-[120px] bg-skin-border rounded mb-1"
              />

              <div
                class="block md:hidden h-[19px] w-11/12 bg-skin-border rounded mb-1"
              />

              <div
                class="h-[19px] w-1/2 md:w-[512px] bg-skin-border rounded mb-2"
              />

              <div class="flex items-center gap-1 mb-[3px]">
                <div class="h-3 w-[80px] bg-skin-border rounded" />
                <div class="h-3 w-[60px] bg-skin-border rounded" />
                <div class="h-3 w-[80px] bg-skin-border rounded" />
                <div class="h-3 w-[60px] bg-skin-border rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
