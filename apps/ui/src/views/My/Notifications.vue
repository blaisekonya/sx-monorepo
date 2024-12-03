<script setup lang="ts">
import { _rt } from '@/helpers/utils';
import { useScrollVisibility } from '@/composables/useScrollVisibility';

const notificationsStore = useNotificationsStore();
const { setTitle } = useTitle();
const { isVisible, isMobile } = useScrollVisibility();

const stickyHeaderClass = computed(() => {
  if (!isMobile.value) return 'top-[72px]';
  return isVisible.value ? 'top-[72px]' : 'top-0';
});

watchEffect(async () => {
  setTitle(
    `Notifications${notificationsStore.unreadNotificationsCount ? ` (${notificationsStore.unreadNotificationsCount} unread)` : ''}`
  );
});

watch(
  () => notificationsStore.unreadNotificationsCount,
  () => {
    notificationsStore.refreshLastUnreadTs();
  },
  { immediate: true }
);

onUnmounted(() => notificationsStore.markAllAsRead());
</script>

<template>
  <div>
    <UiLabel label="Notifications" :sticky-offset="72" class="transition-[top] duration-200"
      :class="stickyHeaderClass" />
    <UiLoading v-if="notificationsStore.loading" class="block px-4 py-3" />
    <div v-else-if="notificationsStore.notifications.length">
      <div v-for="(notification, i) in notificationsStore.notifications" :key="i">
        <div class="border-b px-3 sm:px-4 py-2.5 sm:py-[13px] flex space-x-3"
          :class="{ 'bg-skin-border/20': notification.unread }">
          <div class="flex flex-col">
            <div class="flex items-start">
              <SpaceAvatar
                :space="{ id: notification.proposal.space.id, avatar: notification.proposal.space.avatar, network: notification.proposal.network }"
                :size="32" class="mr-2 relative top-1.5" />
              <div class="flex flex-col">
                <div class="flex items-baseline gap-1">
                  <AppLink :to="{
                    name: 'space-overview',
                    params: {
                      space: `${notification.proposal.network}:${notification.proposal.space.id}`
                    }
                  }" class="font-bold">
                    {{ notification.proposal.space.name }}
                  </AppLink>
                  <span class="text-skin-text text-sm">
                    voting {{ notification.type }}
                    {{ _rt(notification.timestamp) }}
                  </span>
                </div>
                <AppLink :to="{
                  name: 'space-proposal-overview',
                  params: {
                    proposal: notification.proposal.proposal_id,
                    space: `${notification.proposal.network}:${notification.proposal.space.id}`
                  }
                }">
                  <h3 class="text-[17px] font-normal [overflow-wrap:anywhere] leading-6"
                    v-text="notification.proposal.title || `#${notification.proposal.proposal_id}`" />
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
