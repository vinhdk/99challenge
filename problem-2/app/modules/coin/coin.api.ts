import { ICoin } from './coin.interface';
import axios from 'axios';

export const COINGECKO_API_V3 = 'https://api.coingecko.com/api/v3';

export const fetchCoins = async (
  page = 1,
  perPage = 100
): Promise<ICoin[]> => {
  const { data } = await axios.get(`${COINGECKO_API_V3}/coins/markets`, {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: perPage,
      page,
    },
  });

  return data;
};
