import coinbaseIcon from '@/assets/connectors/coinbase.png';
import gnosisIcon from '@/assets/connectors/gnosis.png';
import metamaskIcon from '@/assets/connectors/metamask.png';
import starknetIcon from '@/assets/connectors/starknet.png';
import walletconnectIcon from '@/assets/connectors/walletconnect.png';
import { getUrl } from '@/helpers/utils';
import { APP_NAME } from './constants';

export default {
  injected: {
    id: 'injected',
    name: 'MetaMask',
    type: 'injected',
    root: 'ethereum',
    icon: metamaskIcon
  },
  walletconnect: {
    id: 'walletconnect',
    name: 'WalletConnect',
    network: '1',
    icon: walletconnectIcon,
    options: {
      projectId: 'cc8fce167e9b87d538f58ac46a9f30ba',
      chains: [],
      optionalChains: [
        1, 10, 56, 100, 250, 4002, 8453, 42161, 137, 1088, 11155111
      ],
      optionalMethods: ['eth_sendTransaction', 'eth_signTypedData_v4'],
      showQrModal: true
    }
  },
  walletlink: {
    id: 'walletlink',
    name: 'Coinbase',
    network: '1',
    icon: coinbaseIcon,
    options: {
      appName: APP_NAME,
      darkMode: false,
      chainId: 1,
      ethJsonrpcUrl: 'https://cloudflare-eth.com'
    }
  },
  gnosis: {
    id: 'gnosis',
    type: 'gnosis',
    name: 'Gnosis Safe',
    icon: gnosisIcon
  },
  argentx: {
    id: 'argentx',
    name: 'Starknet',
    root: 'starknet',
    icon: starknetIcon
  }
};

export function mapConnectorId(sourceName: string) {
  if (sourceName === 'metamask') return 'injected';
  if (sourceName === 'coinbase') return 'walletlink';

  return sourceName;
}

export function getConnectorIconUrl(url) {
  if (url.startsWith('ipfs://')) return getUrl(url);

  return url;
}
