<script setup lang="ts">
import { ethers } from 'ethers';
import { computed, ref, watch } from 'vue';
import ButtonClaimID from '@/components/ButtonClaimID.vue';
import ButtonReferral from '@/components/ButtonReferral.vue';
import {
  DRACHMA_CONTRACT_ADDRESS,
  GLOBAL_VOTER_ID_ZKME_ADDRESS
} from '@/helpers/constants';
import { getUserStats } from '@/helpers/efp';
import {
  _n,
  _p,
  autoLinkText,
  compareAddresses,
  getCacheHash,
  getSocialNetworksLink,
  shortenAddress
} from '@/helpers/utils';
import { addressValidator as isValidAddress } from '@/helpers/validation';
import { enabledNetworks, getNetwork } from '@/networks';
import { Space, UserActivity } from '@/types';

const route = useRoute();
const usersStore = useUsersStore();
const spacesStore = useSpacesStore();
const { logout, web3 } = useWeb3();
const { setTitle } = useTitle();
const { copy, copied } = useClipboard();

const activities = ref<
  (UserActivity & {
    space: Space;
    proposal_percentage: number;
    vote_percentage: number;
  })[]
>([]);
const loadingActivities = ref(false);
const modalOpenEditUser = ref(false);
const loaded = ref(false);
const voterIdBalance = ref<string | null>(null);
const loadingVoterId = ref(true);
const hasAttestation = ref<boolean>(false);
const loadingAttestation = ref(true);
const attestationId = ref<string | null>(null);
const loadingBabt = ref(true);
const babtBalance = ref<string | null>(null);

const userMetadata = reactive({
  loading: false,
  loaded: false,
  followers_count: 0,
  following_count: 0
});

const id = computed(() => route.params.user as string);

const user = computed(() => usersStore.getUser(id.value));

const socials = computed(() => getSocialNetworksLink(user.value));

const cb = computed(() => getCacheHash(user.value?.avatar));

async function loadUserMetadata(userId: string) {
  userMetadata.loading = true;

  try {
    const userStats = await getUserStats(userId);

    userMetadata.followers_count = userStats.followers_count;
    userMetadata.following_count = userStats.following_count;
    userMetadata.loading = false;
    userMetadata.loaded = true;
  } catch (e) {
    userMetadata.loading = false;
  }
}

async function loadActivities(userId: string) {
  loadingActivities.value = true;

  try {
    const results = await Promise.all(
      enabledNetworks.map(networkId =>
        getNetwork(networkId).api.loadUserActivities(userId)
      )
    );

    const aggregatedActivities = results
      .flat()
      .sort(
        (a, b) =>
          b.proposal_count - a.proposal_count || b.vote_count - a.vote_count
      );

    await spacesStore.fetchSpaces(
      aggregatedActivities
        .map(activity => activity.spaceId)
        .filter(id => !spacesStore.spacesMap.has(id))
    );

    const totalProposals = aggregatedActivities.reduce(
      (a, b) => a + b.proposal_count,
      0
    );
    const totalVotes = aggregatedActivities.reduce(
      (a, b) => a + b.vote_count,
      0
    );

    activities.value = aggregatedActivities
      .map((activity: UserActivity) => {
        const space = spacesStore.spacesMap.get(activity.spaceId);

        if (!space) return;

        return {
          ...activity,
          space,
          proposal_percentage:
            totalProposals > 0 ? activity.proposal_count / totalProposals : 0,
          vote_percentage: totalVotes > 0 ? activity.vote_count / totalVotes : 0
        };
      })
      .filter(activity => activity !== undefined);
  } finally {
    loadingActivities.value = false;
  }
}

async function fetchVoterIdBalance(userId: string) {
  try {
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const abi = ['function balanceOf(address owner) view returns (uint256)'];
    const contract = new ethers.Contract(
      GLOBAL_VOTER_ID_ZKME_ADDRESS,
      abi,
      provider
    );

    const balance = await contract.balanceOf(userId);
    voterIdBalance.value = ethers.formatUnits(balance, 18);
  } catch (error) {
    console.error('Error fetching voter ID balance:', error);
    voterIdBalance.value = '0';
  } finally {
    loadingVoterId.value = false;
  }
}

async function checkUserAttestation(userId: string) {
  try {
    loadingAttestation.value = true;

    const response = await fetch('https://base.easscan.org/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          query {
            attestations(
              where: {
                schemaId: { equals: "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9" },
                recipient: { equals: "${userId}" }
              }
            ) {
              id
              attester
              recipient
              revoked
            }
          }
        `
      })
    });

    const result = await response.json();
    console.log('Attestation response:', result);

    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      return;
    }

    // Find first valid attestation and store its ID
    const validAttestation = result.data?.attestations?.find(
      attestation => !attestation.revoked
    );

    hasAttestation.value = !!validAttestation;
    attestationId.value = validAttestation?.id || null;
  } catch (error) {
    console.error('Error checking attestation:', error);
    hasAttestation.value = false;
  } finally {
    loadingAttestation.value = false;
  }
}

async function fetchBabtBalance(userId: string) {
  try {
    const provider = new ethers.JsonRpcProvider(
      'https://bsc-dataseed.bnbchain.org'
    );
    const abi = ['function balanceOf(address owner) view returns (uint256)'];
    const contract = new ethers.Contract(
      '0x2B09d47D550061f995A3b5C6F0Fd58005215D7c8',
      abi,
      provider
    );

    const balance = await contract.balanceOf(userId);
    babtBalance.value = ethers.formatUnits(balance, 0);
  } catch (error) {
    console.error('Error fetching BABT balance:', error);
    babtBalance.value = '0';
  } finally {
    loadingBabt.value = false;
  }
}

watch(
  id,
  async userId => {
    loaded.value = false;
    userMetadata.loaded = false;

    if (!isValidAddress(userId)) {
      loaded.value = true;
      return;
    }

    await usersStore.fetchUser(userId);
    loadActivities(userId);
    loadUserMetadata(userId);

    loaded.value = true;
  },
  { immediate: true }
);

watch(
  id,
  userId => {
    if (isValidAddress(userId)) {
      fetchVoterIdBalance(userId);
      checkUserAttestation(userId);
      fetchBabtBalance(userId);
    }
  },
  { immediate: true }
);

watchEffect(() => setTitle(`${user.value?.name || id.value} user profile`));
</script>

<template>
  <UiLoading v-if="!loaded" class="block p-4" />
  <div v-else-if="!user" class="px-4 py-3 flex items-center space-x-2">
    <IH-exclamation-circle class="inline-block" />
    <span>This user does not exist</span>
  </div>
  <div v-else>
    <div
      class="relative bg-skin-border h-[156px] md:h-[140px] mb-[-86px] md:mb-[-70px] top-[-1px]"
    >
      <div class="size-full overflow-hidden">
        <UserCover :user="user" class="!rounded-none w-full min-h-full" />
      </div>
      <div
        class="relative bg-skin-bg h-[16px] -top-3 rounded-t-[16px] md:hidden"
      />
      <div class="absolute right-4 top-4 space-x-2 flex">
        <UiTooltip title="Share">
          <DropdownShare :shareable="user" type="user" class="!px-0 w-[46px]" />
        </UiTooltip>
        <UiTooltip
          v-if="compareAddresses(web3.account, user.id)"
          title="Edit profile"
        >
          <UiButton class="!px-0 w-[46px]" @click="modalOpenEditUser = true">
            <IH-cog class="inline-block" />
          </UiButton>
        </UiTooltip>
        <UiTooltip title="Logout">
          <UiButton
            v-if="compareAddresses(web3.account, user.id)"
            class="!px-0 w-[46px]"
            @click="logout"
          >
            <IH-logout class="inline-block" />
          </UiButton>
        </UiTooltip>
      </div>
    </div>
    <div class="px-4">
      <div class="mb-5 relative">
        <UiStamp
          :id="user.id"
          :size="90"
          :cb="cb"
          class="relative mb-2 border-[4px] border-skin-bg !bg-skin-border !rounded-full left-[-4px]"
        />
        <h1 class="break-words" v-text="user.name || shortenAddress(user.id)" />
        <div class="mb-3 flex items-center space-x-2">
          <span class="text-skin-text" v-text="shortenAddress(user.id)" />
          <UiTooltip title="Copy address">
            <button
              type="button"
              class="text-skin-text"
              @click.prevent="copy(user.id)"
            >
              <IH-duplicate v-if="!copied" class="inline-block" />
              <IH-check v-else class="inline-block" />
            </button>
          </UiTooltip>
          <span v-if="userMetadata.loading">
            <span class="flex items-center space-x-[3px]">
              <span class="text-skin-text">·</span>
              <span class="flex items-center space-x-[3px]">
                <UiSkeleton class="h-[18px] w-[11px]" />
                <span class="text-skin-text">following</span>
              </span>
              <span class="text-skin-text ml-[3px]">·</span>
              <span class="flex items-center space-x-[3px]">
                <UiSkeleton class="h-[18px] w-[11px]" />
                <span class="text-skin-text">followers</span>
              </span>
            </span>
          </span>
          <span v-else-if="userMetadata.loaded">
            ·
            <a :href="`https://ethfollow.xyz/${user.id}`" target="_blank">
              {{ _n(userMetadata.following_count) }}
              <span class="text-skin-text">following</span>
            </a>
            ·
            <a :href="`https://ethfollow.xyz/${user.id}`" target="_blank">
              {{ _n(userMetadata.followers_count) }}
              <span class="text-skin-text">followers</span>
            </a>
          </span>
        </div>
        <div
          v-if="user.about"
          class="max-w-[540px] text-skin-link text-md leading-[26px] mb-3 break-words"
          v-html="autoLinkText(user.about)"
        />
        <div v-if="socials.length" class="space-x-2 flex">
          <template v-for="social in socials" :key="social.key">
            <a
              :href="social.href"
              target="_blank"
              class="text-[#606060] hover:text-skin-link"
            >
              <component :is="social.icon" class="size-[26px]" />
            </a>
          </template>
        </div>
      </div>
      <div v-if="compareAddresses(web3.account, user.id)" class="mb-3">
        <div class="flex flex-col gap-3 max-w-[480px] 2xl:flex-row 2xl:gap-6">
          <div class="flex-1">
            <h4 class="mb-2 eyebrow leading-8">Proofs of personhood</h4>
            <div class="flex flex-col gap-2.5">
              <!-- First proof -->
              <div>
                <div v-if="loadingVoterId">
                  <span class="flex items-center justify-between w-full">
                    <span>Global Voter ID</span>
                    <div class="2xl:ml-3">
                      <UiSkeleton class="h-[46px] w-[46px] !rounded-full" />
                    </div>
                  </span>
                </div>
                <div
                  v-else-if="
                    !voterIdBalance || parseFloat(voterIdBalance) === 0
                  "
                  class="flex items-center justify-between w-full"
                >
                  <span>Global Voter ID</span>
                  <div class="2xl:ml-3">
                    <ButtonClaimID
                      :user="true"
                      @voter-id-claimed="balance => (voterIdBalance = balance)"
                    />
                  </div>
                </div>
                <div v-else class="flex items-center justify-between w-full">
                  <span>Global Voter ID</span>
                  <div class="2xl:ml-3">
                    <ButtonClaimID
                      :user="true"
                      :done="true"
                      @voter-id-claimed="balance => (voterIdBalance = balance)"
                    />
                  </div>
                </div>
              </div>

              <!-- Second proof -->
              <div>
                <div v-if="loadingBabt">
                  <span class="flex items-center justify-between w-full">
                    <span>Binance Account Bound Token</span>
                    <div class="2xl:ml-3">
                      <UiSkeleton class="h-[46px] w-[46px] !rounded-full" />
                    </div>
                  </span>
                </div>
                <div
                  v-else-if="babtBalance && parseFloat(babtBalance) > 0"
                  class="flex items-center justify-between w-full"
                >
                  <span>Binance Account Bound Token</span>
                  <div class="2xl:ml-3">
                    <a href="https://www.binance.com/en/BABT" target="_blank">
                      <UiButton class="!px-0 w-[46px]">
                        <IH-check class="inline-block" />
                      </UiButton>
                    </a>
                  </div>
                </div>
                <div v-else class="flex items-center justify-between w-full">
                  <span>Binance Account Bound Token</span>
                  <div class="2xl:ml-3">
                    <a href="https://www.binance.com/en/BABT" target="_blank">
                      <UiButton class="!px-0 w-[46px]">
                        <IH-plus class="inline-block" />
                      </UiButton>
                    </a>
                  </div>
                </div>
              </div>

              <!-- Third proof -->
              <div>
                <div v-if="loadingAttestation">
                  <span class="flex items-center justify-between w-full">
                    <span>Coinbase Verification</span>
                    <div class="2xl:ml-3">
                      <UiSkeleton class="h-[46px] w-[46px] !rounded-full" />
                    </div>
                  </span>
                </div>
                <div
                  v-else-if="hasAttestation"
                  class="flex items-center justify-between w-full"
                >
                  <span>Coinbase Verification</span>
                  <div class="2xl:ml-3">
                    <a
                      :href="`https://base.easscan.org/attestation/view/${attestationId}`"
                      target="_blank"
                    >
                      <UiButton class="!px-0 w-[46px]">
                        <IH-check class="inline-block" />
                      </UiButton>
                    </a>
                  </div>
                </div>
                <div v-else class="flex items-center justify-between w-full">
                  <span>Coinbase Verification</span>
                  <div class="2xl:ml-3">
                    <a
                      href="https://www.coinbase.com/onchain-verify"
                      target="_blank"
                    >
                      <UiButton class="!px-0 w-[46px]">
                        <IH-plus class="inline-block" />
                      </UiButton>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h4 class="mb-2 eyebrow leading-8">Activity</h4>
    </div>
    <div class="border-b w-full">
      <div class="flex space-x-1 px-4 leading-8">
        <span class="w-[60%] lg:w-[50%] truncate">Space</span>
        <span class="w-[20%] lg:w-[25%] text-right truncate">Proposals</span>
        <span class="w-[20%] lg:w-[25%] text-right truncate">Votes</span>
      </div>
    </div>
    <div v-if="loadingActivities" class="animate-pulse">
      <div v-for="i in 2" :key="i" class="mx-4 border-b flex space-x-1 py-3">
        <div
          class="flex items-center gap-x-3 leading-[22px] w-[60%] lg:w-[50%] font-semibold truncate"
        >
          <!-- Space Avatar Skeleton -->
          <UiSkeleton class="size-[32px] !rounded-[4px]" />
          <!-- Space Name Skeleton -->
          <UiSkeleton class="h-[18px] w-[120px]" />
        </div>
        <!-- Proposals Column -->
        <div
          class="flex flex-col justify-center text-right w-[20%] lg:w-[25%] leading-[22px] truncate"
        >
          <UiSkeleton class="h-[22px] w-[24px] ml-auto" />
          <UiSkeleton class="h-[17px] w-[32px] ml-auto mt-[5px]" />
        </div>
        <!-- Votes Column -->
        <div
          class="flex flex-col justify-center text-right w-[20%] lg:w-[25%] leading-[22px] truncate"
        >
          <UiSkeleton class="h-[22px] w-[24px] ml-auto" />
          <UiSkeleton class="h-[17px] w-[32px] ml-auto mt-[5px]" />
        </div>
      </div>
    </div>
    <div
      v-else-if="!activities.length"
      class="px-4 py-3 flex items-center space-x-2"
    >
      <IH-exclamation-circle class="inline-block" />
      <span>This user does not have any activities yet.</span>
    </div>
    <AppLink
      v-for="(activity, i) in activities"
      v-else
      :key="i"
      :to="{
        name: 'space-user-statement',
        params: {
          space: activity.spaceId,
          user: user.id
        }
      }"
      class="mx-4 border-b flex space-x-1 py-3"
    >
      <div
        class="flex items-center gap-x-3 leading-[22px] w-[60%] lg:w-[50%] font-semibold text-skin-link truncate"
      >
        <SpaceAvatar
          :space="activity.space"
          :size="32"
          class="!rounded-[4px]"
        />
        <span class="flex-auto w-0 truncate" v-text="activity.space.name" />
      </div>
      <div
        class="flex flex-col justify-center text-right w-[20%] lg:w-[25%] leading-[22px] truncate"
      >
        <h4
          class="text-skin-link truncate"
          v-text="_n(activity.proposal_count)"
        />
        <div
          class="text-[17px] truncate"
          v-text="_p(activity.proposal_percentage)"
        />
      </div>
      <div
        class="flex flex-col justify-center text-right w-[20%] lg:w-[25%] leading-[22px] truncate"
      >
        <h4 class="text-skin-link truncate" v-text="_n(activity.vote_count)" />
        <div
          class="text-[17px] truncate"
          v-text="_p(activity.vote_percentage)"
        />
      </div>
    </AppLink>
    <teleport to="#modal">
      <ModalEditUser
        v-if="compareAddresses(web3.account, user.id)"
        :open="modalOpenEditUser"
        :user="user"
        @close="modalOpenEditUser = false"
      />
    </teleport>
  </div>
</template>
