<script setup lang="ts">
import { computed } from 'vue';
import { useToast } from '@/composables/useToast';
import { useWeb3 } from '@/composables/useWeb3';

const { web3Account } = useWeb3();
const { toast } = useToast();

const referralLink = computed(() => {
  if (!web3Account.value) return '';
  const baseUrl = window.location.origin;
  return `${baseUrl}/?ref=${web3Account.value}`;
});

const copyReferralLink = async () => {
  try {
    await navigator.clipboard.writeText(referralLink.value);
    toast('Referral link copied to clipboard');
  } catch (error) {
    console.error('Failed to copy:', error);
    toast('Failed to copy referral link', 'error');
  }
};

const shareOptions = [
  {
    name: 'X',
    icon: 'IH-x-mark',
    action: () => {
      const text = encodeURIComponent(
        `Join the World Republic and claim your basic income! ${referralLink.value}`
      );
      window.open(`https://x.com/intent/tweet?text=${text}`, '_blank');
    }
  },
  {
    name: 'Telegram',
    icon: 'IH-paper-airplane',
    action: () => {
      const text = encodeURIComponent(
        `Join the World Republic and claim your basic income! ${referralLink.value}`
      );
      window.open(`https://t.me/share/url?url=${text}`, '_blank');
    }
  }
];
</script>

<template>
  <div class="flex items-center justify-between mb-2.5 pt-2 sm:pb-1.5">
    <span>Invite friends</span>
    <span class="px-3 py-1 bg-skin-link/10 text-skin-link rounded-full text-sm">
      10 drachma per referral
    </span>
  </div>

  <div class="space-y-2.5">
    <div class="flex gap-2">
      <input
        type="text"
        :value="referralLink"
        readonly
        class="flex-1 px-3 py-2 rounded-lg border bg-skin-bg text-skin-text font-mono text-sm"
      />
      <UiButton class="!px-0 w-[46px]" @click="copyReferralLink">
        <IH-clipboard-document class="inline-block" />
      </UiButton>
    </div>

    <div class="flex gap-2">
      <UiButton
        v-for="option in shareOptions"
        :key="option.name"
        class="flex-1 !py-2 !px-0"
        @click="option.action"
      >
        <component :is="option.icon" class="h-4 w-4" />
        Share on {{ option.name }}
      </UiButton>
    </div>
  </div>
</template>
