<script setup lang="ts">
import ICGithub from '~icons/c/github';
import ICTelegram from '~icons/c/telegram';
import ICX from '~icons/c/x';

const SOCIALS = [
  {
    href: 'https://t.me/worldrepubliccommunity',
    icon: ICTelegram
  },
  {
    href: 'https://x.com/worldrepublicen',
    icon: ICX
  },
  {
    href: 'https://github.com/worldrepublicorg',
    icon: ICGithub
  }
];
</script>

<template>
  <div class="pt-6 pb-5 border-t">
    <UiContainer class="!max-w-screen-lg space-y-7">
      <div class="grid grid-col-2 md:grid-cols-4 space-y-4 md:space-y-0">
        <div class="space-y-2">
          <div class="eyebrow">Organization</div>
          <div class="space-y-1">
            <div>
              <AppLink :to="{ name: 'site-terms' }">Terms of use</AppLink>
            </div>
            <div>
              <AppLink :to="{ name: 'site-policy' }">Privacy policy</AppLink>
            </div>
            <div>
              <a href="mailto:info@worldrepublic.org"> Contact us </a>
            </div>
          </div>
        </div>
        <div class="space-y-2">
          <div class="eyebrow">Sponsors</div>
          <div class="space-y-1">
            <div>
              <a href="https://foundation.world.org" target="_blank">
                World Foundation
                <IH-arrow-sm-right
                  class="inline-block -rotate-45 mb-0.5 -ml-0.5"
                />
              </a>
            </div>
            <div>
              <a href="https://www.optimism.io/" target="_blank">
                Optimism Collective
                <IH-arrow-sm-right
                  class="inline-block -rotate-45 mb-0.5 -ml-0.5"
                />
              </a>
            </div>
            <div>
              <a href="https://vercel.com" target="_blank">
                Vercel
                <IH-arrow-sm-right
                  class="inline-block -rotate-45 mb-0.5 -ml-0.5"
                />
              </a>
            </div>
          </div>
        </div>
        <div class="space-y-2">
          <div class="eyebrow">Resources</div>
          <div class="space-y-1">
            <div>
              <a href="https://t.me/worldrepublicsupport" target="_blank">
                Support
                <IH-arrow-sm-right
                  class="inline-block -rotate-45 mb-0.5 -ml-0.5"
                />
              </a>
            </div>
          </div>
        </div>
        <div class="space-y-2">
          <div class="eyebrow">Code</div>
          <div class="space-y-1">
            <div>
              <a
                href="https://github.com/worldrepublicorg/mini-app"
                target="_blank"
              >
                Mini app
                <IH-arrow-sm-right
                  class="inline-block -rotate-45 mb-0.5 -ml-0.5"
                />
              </a>
            </div>
            <div>
              <a
                href="https://github.com/worldrepublicorg/smart-contracts"
                target="_blank"
              >
                Smart contracts
                <IH-arrow-sm-right
                  class="inline-block -rotate-45 mb-0.5 -ml-0.5"
                />
              </a>
            </div>
            <div>
              <a
                href="https://github.com/worldrepublicorg/sx-monorepo"
                target="_blank"
              >
                Website
                <IH-arrow-sm-right
                  class="inline-block -rotate-45 mb-0.5 -ml-0.5"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="flex max-sm:flex-col max-sm:space-y-5">
        <div
          class="flex-grow flex max-sm:flex-col max-sm:items-start items-center"
        >
          <div class="flex items-center">
            <div
              class="box-border size-[24px] mr-3 rounded-full border-[4px] border-skin-primary"
            ></div>
            © {{ new Date().getFullYear() }} World Republic
          </div>
        </div>
        <div class="flex space-x-3">
          <a
            v-for="social in SOCIALS"
            :key="social.href"
            :href="social.href"
            target="_blank"
            class="text-[#606060] hover:text-skin-link"
          >
            <component :is="social.icon" class="size-[28px] text-skin-link" />
          </a>
        </div>
      </div>
    </UiContainer>
  </div>
</template>
