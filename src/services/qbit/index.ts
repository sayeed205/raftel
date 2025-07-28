import type IProvider from '@/services/qbit/i-provider';
import MockProvider from '@/services/qbit/mock-provider';
import QBitProvider from '@/services/qbit/qbit-provider';

const qbit: IProvider =
  import.meta.env.MODE === 'demo' ||
  (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_PROVIDER === 'true')
    ? MockProvider.getInstance()
    : QBitProvider.getInstance();

export default qbit;
