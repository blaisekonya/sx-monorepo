import { ethers } from 'ethers';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useWeb3 } from '@/composables/useWeb3';
import { GLOBAL_VOTER_ID_ZKME_ADDRESS } from '@/helpers/constants';

export const useTasksStore = defineStore('tasks', () => {
  const { web3 } = useWeb3();
  const voterIdBalance = ref<string | null>(null);
  const basicIncomeSetUp = ref(false);
  const loading = ref(true);

  async function fetchVoterIdBalance() {
    if (!web3.value.account) return;

    try {
      const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
      const abi = ['function balanceOf(address owner) view returns (uint256)'];
      const contract = new ethers.Contract(
        GLOBAL_VOTER_ID_ZKME_ADDRESS,
        abi,
        provider
      );

      const balance = await contract.balanceOf(web3.value.account);
      voterIdBalance.value = ethers.formatUnits(balance, 18);
    } catch (error) {
      console.error('Error fetching voter ID balance:', error);
      voterIdBalance.value = '0';
    } finally {
      loading.value = false;
    }
  }

  return {
    voterIdBalance,
    basicIncomeSetUp,
    loading,
    fetchVoterIdBalance
  };
});
