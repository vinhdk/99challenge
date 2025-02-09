import './swap.component.scss';
import { CoinSelector, fetchCoins, ICoin, useCoinStore } from '../coin';
import { FC, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NumericFormat } from 'react-number-format';
import { formatNumber } from '../../constants';
import { useSwapAmount, useSwapFromCoin, useSwapToCoin } from './swap.hooks';

const BINANCE_WS = 'wss://stream.binance.com:9443/ws';

export const Swap: FC = () => {
  const { coins, setCoins } = useCoinStore();
  const [fromCoin, setFromCoin] = useSwapFromCoin();
  const [toCoin, setToCoin] = useSwapToCoin();
  const [amount, setAmount] = useSwapAmount();
  const [convertedAmount, setConvertedAmount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const [selectorRef, setSelectorRef] = useState<{
    direction: 'from' | 'to';
    ref: RefObject<HTMLLabelElement>;
  } | null>(null);
  const fromContainerRef = useRef<HTMLLabelElement>(null);
  const toContainerRef = useRef<HTMLLabelElement>(null);

  // Query to Fetch Coins
  const { data, isLoading, error } = useQuery({
    queryKey: ['coins'],
    queryFn: () => fetchCoins(),
    staleTime: 60000,
  });

  // Store coins in Zustand after the first fetch
  useEffect(() => {
    if (data && coins.length === 0) {
      setCoins(data);
      setFromCoin(data[0]);
      setToCoin(data[1]);
    }
  }, [data, coins.length, setCoins, setFromCoin, setToCoin]);

  // Calculate Swap Amount
  useEffect(() => {
    if (fromCoin && toCoin) {
      const rate = fromCoin.current_price / toCoin.current_price;
      setConvertedAmount(amount * rate);
    }
  }, [amount, fromCoin, toCoin]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.e === 'trade') {
          const price = parseFloat(data.p);
          if (fromCoin && data.s === `${fromCoin.symbol.toUpperCase()}USDT`) {
            setFromCoin((prev) =>
              prev ? { ...prev, current_price: price } : prev
            );
          }
          if (toCoin && data.s === `${toCoin.symbol.toUpperCase()}USDT`) {
            setToCoin((prev) =>
              prev ? { ...prev, current_price: price } : prev
            );
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    },
    [fromCoin, setFromCoin, setToCoin, toCoin]
  );

  // WebSocket connection management
  useEffect(() => {
    if (!fromCoin || !toCoin) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create new WebSocket connection
    const ws = new WebSocket(BINANCE_WS);
    wsRef.current = ws;

    ws.onopen = () => {
      // Subscribe to both fromCoin and toCoin streams
      const subscribeMsg = {
        method: 'SUBSCRIBE',
        params: [
          `${fromCoin.symbol.toLowerCase()}usdt@trade`,
          `${toCoin.symbol.toLowerCase()}usdt@trade`,
        ],
        id: 1,
      };
      ws.send(JSON.stringify(subscribeMsg));
    };

    ws.onmessage = handleWebSocketMessage;

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fromCoin, toCoin, handleWebSocketMessage]);

  const handleCoinSelect = (type: 'from' | 'to', selectedCoin: ICoin) => {
    if (type === 'from') {
      if (selectedCoin.id === toCoin?.id) {
        // If selecting same coin as toCoin, swap them
        setFromCoin(toCoin);
        setToCoin(fromCoin);
      } else {
        setFromCoin(selectedCoin);
      }
    } else {
      if (selectedCoin.id === fromCoin?.id) {
        // If selecting same coin as fromCoin, swap them
        setToCoin(fromCoin);
        setFromCoin(toCoin);
      } else {
        setToCoin(selectedCoin);
      }
    }
  };

  const handleSwapPositions = () => {
    setFromCoin(toCoin);
    setToCoin(fromCoin);
  };

  if (isLoading)
    return (
      <p className="text-center text-branding-foreground-50 text-b2">
        Loading coins...
      </p>
    );
  if (error)
    return (
      <p className="text-center text-branding-error-500 text-b2">
        Error fetching coins
      </p>
    );

  return (
    <form className="swap" onSubmit={(e) => e.preventDefault()}>
      <header>
        <h6>Currency Swap</h6>
      </header>

      <main>
        <label className="sao-control w-full" ref={fromContainerRef}>
          <span className="text-b3 text-branding-foreground-50 font-bold">
            From
          </span>
          <NumericFormat
            value={amount}
            onValueChange={(values) => {
              const { floatValue } = values;
              setAmount(floatValue ?? 0);
            }}
            thousandSeparator=","
            decimalScale={6}
            allowNegative={false}
            placeholder="0"
            className="sao-input"
          />

          <button
            className="sao-button sao-button--tertiary sao-button--small"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectorRef({
                direction: 'from',
                ref: fromContainerRef as RefObject<HTMLLabelElement>,
              });
            }}
          >
            {fromCoin ? (
              <>
                <img
                  src={fromCoin.image}
                  alt={fromCoin.name}
                  className="w-6 h-6"
                />
                <span>{fromCoin.symbol?.toUpperCase()}</span>
              </>
            ) : (
              <span>Select coin</span>
            )}
          </button>
        </label>

        <button
          className="sao-button sao-button--small sao-button--tertiary"
          onClick={handleSwapPositions}
        >
          <i className="sao-icon sao-icon-filtered-action-swap-vert bg-branding-foreground-50"></i>
        </button>

        <label className="sao-control w-full" ref={toContainerRef}>
          <span className="text-b3 text-branding-foreground-50 font-bold">
            To
          </span>

          <input
            type="text"
            value={formatNumber(convertedAmount, true)}
            readOnly
            className="sao-input"
          />

          <button
            className="sao-button sao-button--tertiary sao-button--small"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectorRef({
                direction: 'to',
                ref: toContainerRef as RefObject<HTMLLabelElement>,
              });
            }}
          >
            {toCoin ? (
              <>
                <img src={toCoin.image} alt={toCoin.name} className="w-6 h-6" />
                <span>{toCoin.symbol?.toUpperCase()}</span>
              </>
            ) : (
              <span>Select coin</span>
            )}
          </button>
        </label>

        {selectorRef && (
          <CoinSelector
            onClose={() => setSelectorRef(null)}
            onSelect={(coin) => handleCoinSelect(selectorRef.direction, coin)}
            selectedCoin={selectorRef.direction === 'from' ? fromCoin : toCoin}
            coins={coins}
            containerRef={selectorRef.ref as RefObject<HTMLLabelElement>}
          />
        )}
      </main>

      <footer>
        <pre>Vinh (Elias) Dang</pre>

        <ul>
          <a
            className="sao-button sao-button--tertiary sao-button--small !w-[36px] !p-[7px]"
            href="https://github.com/vinhdk"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://img.icons8.com/?size=100&id=AZOZNnY73haj&format=png&color=000000"
              alt="Vinh Github"
              title="Vinh Github"
              className="w-5 h-5"
            />
          </a>
          <a
            className="sao-button sao-button--tertiary sao-button--small !w-[36px] !p-[7px]"
            href="https://www.linkedin.com/in/vinh-dang-85164b1b6"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://img.icons8.com/?size=100&id=xuvGCOXi8Wyg&format=png&color=000000"
              alt="Vinh LinkedIn"
              title="Vinh LinkedIn"
              className="w-5 h-5"
            />
          </a>
          <a
            className="sao-button sao-button--tertiary sao-button--small !w-[36px] !p-[7px]"
            href="https://drive.google.com/file/d/1U7ADk3Q6p-ffaLPimjj-LUu3KokO73vT/view?usp=sharing"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://img.icons8.com/?size=100&id=z6faRXwXtVdE&format=png&color=000000"
              alt="Vinh CV"
              title="Vinh CV"
              className="w-5 h-5"
            />
          </a>
        </ul>
      </footer>
    </form>
  );
};
