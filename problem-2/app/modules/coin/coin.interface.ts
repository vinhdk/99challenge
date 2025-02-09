export interface ICoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
}

export interface ICoinStore {
  coins: ICoin[];
  setCoins: (coins: ICoin[]) => void;
}
