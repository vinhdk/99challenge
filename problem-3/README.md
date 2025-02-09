# 99 Challenge

## Problem 2

### Description

#### List out the computational inefficiencies and anti-patterns found in the code block below.
1. This code block uses:
   - ReactJS with TypeScript.
   - Functional components.
   - React Hooks
2. You should also provide a refactored version of the code, but more points are awarded to accurately stating the issues and explaining correctly how to improve them.
```tsx
interface WalletBalance {
   currency: string;
   amount: number;
}
interface FormattedWalletBalance {
   currency: string;
   amount: number;
   formatted: string;
}

interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
   const { children, ...rest } = props;
   const balances = useWalletBalances();
   const prices = usePrices();

   const getPriority = (blockchain: any): number => {
      switch (blockchain) {
         case 'Osmosis':
            return 100
         case 'Ethereum':
            return 50
         case 'Arbitrum':
            return 30
         case 'Zilliqa':
            return 20
         case 'Neo':
            return 20
         default:
            return -99
      }
   }

   const sortedBalances = useMemo(() => {
      return balances.filter((balance: WalletBalance) => {
         const balancePriority = getPriority(balance.blockchain);
         if (lhsPriority > -99) {
            if (balance.amount <= 0) {
               return true;
            }
         }
         return false
      }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
         const leftPriority = getPriority(lhs.blockchain);
         const rightPriority = getPriority(rhs.blockchain);
         if (leftPriority > rightPriority) {
            return -1;
         } else if (rightPriority > leftPriority) {
            return 1;
         }
      });
   }, [balances, prices]);

   const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
      return {
         ...balance,
         formatted: balance.amount.toFixed()
      }
   })

   const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
              <WalletRow
                      className={classes.row}
                      key={index}
                      amount={balance.amount}
                      usdValue={usdValue}
                      formattedAmount={balance.formatted}
              />
      )
   })

   return (
           <div {...rest}>
              {rows}
           </div>
   )
}
```
### Answer:

```tsx
import ex = CSS.ex;

interface WalletBalance {
    currency: string;
    amount: number;
}

/**
 * @name FormattedWalletBalance
 * @problem this can extend from WalletBalance
 * -> instead of duplicating props
 * @solution-1:
 * interface FormattedWalletBalance extends WalletBalance {
 *   formatted: string;
 * }
 * @solution-2:
 * type FormattedWalletBalance = WalletBalance & {
 *   formatted: string;
 * }
 */
interface FormattedWalletBalance extends WalletBalance {
    formatted: string;
}

/**
 * @name Props and BoxProps
 * @problem-1 BoxProps didn't define
 * @problem-2 if don't have any custom props
 * @problem-3 clearly define props if have, and let empty { } type if their is no needed interface declaration
 * -> can direct use BoxProps
 * -> don't create empty interface (eslint)
 */
interface BoxProps {
   children: React.ReactNode;
   className?: string;
}


export enum BlockChainEnvironments {
    Osmosis = 'Osmosis',
    Ethereum = 'Ethereum',
    Arbitrum = 'Arbitrum',
    Zilliqa = 'Zilliqa',
    Neo = 'Neo',
}

/**
 * @name getPriority
 * @problem-1 getPriority can be separate to single function instead of put inside component function
 * @problem-2 blockchain need to declare type instead of any
 * @problem-3 case values good if we can create enum for it
 * @problem-4 return same value should not create 2 blocks (Zilliqa, Neo)
 */
const getPriority = (blockchain?: BlockChainEnvironments | null): number => {
    switch (blockchain) {
        case BlockChainEnvironments.Osmosis:
            return 100
        case BlockChainEnvironments.Ethereum:
            return 50
        case BlockChainEnvironments.Arbitrum:
            return 30
        case BlockChainEnvironments.Zilliqa:
        case BlockChainEnvironments.Neo:
            return 20
        default:
            return -99
    }
}

/**
 * @name WalletPage
 * @problem-1 we can destructure props directly
 */
const WalletPage: React.FC<BoxProps> = ({children, ...rest}: BoxProps) => {
    const balances = useWalletBalances();
    const prices = usePrices();

    /**
     * @name sortedBalances
     * @problem-1 to make sure `useWalletBalances` return WalletBalance[] and don't need to force the type for loop item
     * @problem-2 prices is not used, so can be removed from dependency array
     * @problem-3 the filter can be shorten to only one line
     * and if you have more than one condition -> prefer to use return first instead
     * @problem-4 the sort can be shorten to only one line
     * and if you have more than one condition -> prefer to use return first instead
     */
    const sortedBalances = useMemo(() => {
        return balances
            .filter((balance) => getPriority(balance.blockchain) > -99 && balance.amount <= 0)
            .sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain));
    }, [balances]);

    /**
     * @name formattedBalances
     * @problem-1 use `useMemo` to memoize the result here, listen to sortedBalances
     * @problem-2 can define the type for this array
     * @problem-3 Specify fractionDigits instead of let it empty
     */
     const formattedBalances: FormattedWalletBalance[] = useMemo(() => {
         return sortedBalances.map((balance) => {
            return {
               ...balance,
               formatted: balance.amount.toFixed(2)
            }
         });
    }, [sortedBalances]);
   
    /**
     * @name rows
     * @problem-1 based on sortedBalances's @problem-2, we can use `useMemo` to memoize the result here, listen to sortedBalances, prices
     * @problem-2 look like we require FormattedWalletBalance instead of WalletBalance
     * so we need to use formattedBalances instead of sortedBalances
     * @problem-3 the filter can be shorten to only one line
     * and if you have more than one condition -> prefer to use return first instead
     * @problem-4 prefer to some stable value for key instead of index
     */
    const rows = useMemo(() => {
        return formattedBalances.map((balance, index) => {
           const usdValue = prices[balance.currency] * balance.amount;
           return (
                   <WalletRow
                           className={classes.row}
                           key={balance.id} // ${balance.currency}-${balance.amount}-${index}
                           amount={balance.amount}
                           usdValue={usdValue}
                           formattedAmount={balance.formatted}
                   />
           )
        });
    }, [formattedBalances, prices]);

    return (
        <div {...rest}>
            {rows}
        </div>
    )
}
```
