import { ICoin } from './coin.interface';
import { FC, ReactPortal, RefObject, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ICoinSelectorPosition {
  top: number;
  left: number;
  width: number;
}

export interface ICoinSelectorProps {
  onClose: () => void;
  onSelect: (coin: ICoin) => void;
  selectedCoin?: ICoin | null;
  coins: ICoin[];
  containerRef: RefObject<HTMLLabelElement>;
}

export const CoinSelector: FC<ICoinSelectorProps> = ({
  onClose,
  onSelect,
  selectedCoin,
  coins,
  containerRef,
}): ReactPortal => {
  const [search, setSearch] = useState<string>('');
  const [displayCount, setDisplayCount] = useState<number>(20);
  const [position, setPosition] = useState<ICoinSelectorPosition>({
    top: 0,
    left: 0,
    width: 0,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const displayedCoins = filteredCoins.slice(0, displayCount);

  // Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && displayCount < filteredCoins.length) {
          setDisplayCount((prev) => Math.min(prev + 20, filteredCoins.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [displayCount, filteredCoins.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Update position when dropdown opens
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8, // 4px gap
        left: rect.left,
        width: rect.width,
      });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, containerRef]);

  // Update position on scroll or resize
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [containerRef]);

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        zIndex: 9999,
      }}
      className="sao-select"
    >
      <div className="w-full px-2 flex items-center justify-center">
        <label className="sao-control w-full">
          <i className="sao-icon sao-icon-filtered-action-search"></i>
          <input
            type="text"
            placeholder="Search coins..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setDisplayCount(20); // Reset display count when searching
            }}
            className="sao-input"
          />
        </label>
      </div>

      <section className="overflow-auto w-full flex flex-col gap-2.5 max-h-[200px]">
        {displayedCoins.map((coin) => (
          <button
            key={coin.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(coin);
              onClose();
            }}
            className={`sao-select-item ${
              selectedCoin?.id === coin.id ? 'selected' : ''
            }`}
          >
            <img src={coin.image} alt={coin.name} className="w-6 h-6" />
            <aside>
              <span>{coin.name}</span>
              <strong className="!font-bold !text-b5 text-branding-success-300">{coin.symbol.toUpperCase()}</strong>
            </aside>
          </button>
        ))}

        {/* Observer element */}
        <div ref={observerRef} className="h-4" />
      </section>
    </div>,
    document.body
  );
}
