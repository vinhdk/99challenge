import { ICoin } from '../coin';
import { SwapStorageKeys } from './swap.enum';

export const getSwapFromCoin = () => JSON.parse(localStorage.getItem(SwapStorageKeys.FROM_COIN) ?? 'null');
export const getSwapToCoin = () => JSON.parse(localStorage.getItem(SwapStorageKeys.TO_COIN) ?? 'null');
export const getSwapAmount = () => JSON.parse(localStorage.getItem(SwapStorageKeys.AMOUNT) ?? '1');

export const setSwapFromCoin = (coin: ICoin | null) => localStorage.setItem(SwapStorageKeys.FROM_COIN, JSON.stringify(coin?.id ?? null));
export const setSwapToCoin = (coin: ICoin | null) => localStorage.setItem(SwapStorageKeys.TO_COIN, JSON.stringify(coin?.id ?? null));
export const setSwapAmount = (amount: number) => localStorage.setItem(SwapStorageKeys.AMOUNT, JSON.stringify(amount ?? 1));
