export const formatNumber = (value: number, forceDecimals = false): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: forceDecimals ? 2 : 0,
    maximumFractionDigits: 6
  }).format(value);
};
