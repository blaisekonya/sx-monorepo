<script setup lang="ts">
import { _rt } from '@/helpers/utils';

const notificationsStore = useNotificationsStore();
const { modalAccountWithoutDismissOpen } = useModal();
const { web3 } = useWeb3();
const { setTitle } = useTitle();

watchEffect(async () => {
  setTitle(
    `Notifications${
      notificationsStore.unreadNotificationsCount
        ? ` (${notificationsStore.unreadNotificationsCount} unread)`
        : ''
    }`
  );
});

watch(
  [
    () => web3.value.account,
    () => web3.value.authLoading,
    () => notificationsStore.unreadNotificationsCount
  ],
  ([account, authLoading]) => {
    if (!account && !authLoading) {
      modalAccountWithoutDismissOpen.value = true;
    }

    notificationsStore.refreshLastUnreadTs();
  },
  { immediate: true }
);

onUnmounted(() => {
  modalAccountWithoutDismissOpen.value = false;
});

onUnmounted(() => notificationsStore.markAllAsRead());
</script>

<template>
  <div>
    <UiLabel label="Notifications" sticky />
    <UiLoading v-if="notificationsStore.loading" class="block px-4 py-3" />
    <div v-else-if="notificationsStore.notifications.length">
      <div
        v-for="(notification, i) in notificationsStore.notifications"
        :key="i"
      >
        <div
          class="border-b px-3 sm:px-4 py-2.5 sm:py-[13px] flex space-x-3"
          :class="{ 'bg-skin-border/20': notification.unread }"
        >
          <div class="flex flex-col">
            <div class="flex items-start space-x-2">
              <SpaceAvatar
                :space="{
                  id: notification.proposal.space.id,
                  avatar: notification.proposal.space.avatar,
                  network: notification.proposal.network,
                  active_proposals: null
                }"
                :size="32"
                class="relative top-1.5"
              />
              <div class="flex flex-col">
                <div class="flex items-baseline gap-1">
                  <AppLink
                    :to="{
                      name: 'space-overview',
                      params: {
                        space: `${notification.proposal.network}:${notification.proposal.space.id}`
                      }
                    }"
                    class="font-bold"
                  >
                    {{ notification.proposal.space.name }}
                  </AppLink>
                  <span class="text-skin-text text-sm">
                    voting {{ notification.type }}
                    {{ _rt(notification.timestamp) }}
                  </span>
                </div>
                <AppLink
                  :to="{
                    name: 'space-proposal-overview',
                    params: {
                      proposal: notification.proposal.proposal_id,
                      space: `${notification.proposal.network}:${notification.proposal.space.id}`
                    }
                  }"
                >
                  <h3
                    class="text-[17px] font-normal [overflow-wrap:anywhere] leading-[22px] mb-[1px]"
                    v-text="
                      notification.proposal.title ||
                      `#${notification.proposal.proposal_id}`
                    "
                  />
                </AppLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="px-4 py-3 flex items-center space-x-2">
      <IH-exclamation-circle class="inline-block" />
      <span>All caught up, you don't have any notifications</span>
    </div>
  </div>
</template>
