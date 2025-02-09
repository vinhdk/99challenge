import { useEffect, useState } from 'react';
import { ICoin } from '../coin';
import {
  getSwapAmount,
  getSwapFromCoin,
  getSwapToCoin,
  setSwapAmount,
  setSwapFromCoin,
  setSwapToCoin,
} from './swap.constants';

export const useSwapFromCoin = () => {
  const [fromCoin, setFromCoin] = useState<ICoin | null>(getSwapFromCoin());

  useEffect(() => {
    setSwapFromCoin(fromCoin);
  }, [fromCoin]);

  return [fromCoin, setFromCoin] as const;
};

export const useSwapToCoin = () => {
  const [toCoin, setToCoin] = useState<ICoin | null>(getSwapToCoin());

  useEffect(() => {
    setSwapToCoin(toCoin);
  }, [toCoin]);

  return [toCoin, setToCoin] as const;
};

export const useSwapAmount = () => {
  const [amount, setAmount] = useState(getSwapAmount());

  useEffect(() => {
    setSwapAmount(amount);
  }, [amount]);

  return [amount, setAmount] as const;
};
