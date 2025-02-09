import { create } from 'zustand/index';
import { ICoinStore } from './coin.interface';

export const useCoinStore = create<ICoinStore>((set) => ({
  coins: [],
  setCoins: (coins) => set({ coins }),
}));
