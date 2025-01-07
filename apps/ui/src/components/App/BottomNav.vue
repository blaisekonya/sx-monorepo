<script setup lang="ts">
import IHBell from '~icons/heroicons-outline/bell';
import IHHome from '~icons/heroicons-outline/home';
import IHSearch from '~icons/heroicons-outline/search';
import IHUser from '~icons/heroicons-outline/user';

const { web3 } = useWeb3();
const route = useRoute();

const menu = [
  {
    link: { name: 'my-home' },
    icon: IHHome
  },
  {
    link: { name: 'my-explore' },
    icon: IHSearch
  },
  {
    link: { path: '/s:worldrepublic.eth' },
    icon: defineComponent({
      props: {
        isActive: Boolean
      },
      render() {
        return h('div', {
          class: [
            'box-border h-[18px] w-[18px] rounded-full border-[3px]',
            this.isActive ? 'border-skin-link' : 'border-skin-text'
          ]
        });
      }
    })
  },
  {
    link: { name: 'my-notifications' },
    icon: IHBell
  },
  {
    link: { name: 'user', params: { user: web3.value.account } },
    icon: IHUser
  }
];
</script>

<template>
  <nav class="fixed bottom-0 inset-x-0 z-50 bg-skin-bg border-t text-xs">
    <div class="flex px-4 justify-between">
      <AppLink
        v-for="(item, i) in menu"
        :key="i"
        :to="item.link"
        class="inline-flex flex-col text-center truncate justify-center max-w-[120px]"
        :class="
          (
            item.link.name
              ? route.name === item.link.name
              : route.path === item.link.path
          )
            ? 'text-skin-link'
            : 'text-skin-text'
        "
      >
        <component
          :is="item.icon"
          :is-active="
            item.link.name
              ? route.name === item.link.name
              : route.path === item.link.path
          "
          class="mx-auto size-4"
        />
      </AppLink>
    </div>
  </nav>
</template>
