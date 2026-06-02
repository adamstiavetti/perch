export const LIVE_GLOBE_PAGE_HEIGHT_MULTIPLIERS = {
  mobile: 3,
  desktop: 4.2,
} as const;

type ReachableScrollProgressArgs = {
  pageHeightMultiplier: number;
  transitionDistanceMultiplier: number;
};

export const getMaxReachableScrollProgress = ({
  pageHeightMultiplier,
  transitionDistanceMultiplier,
}: ReachableScrollProgressArgs) => {
  if (transitionDistanceMultiplier <= 0) {
    return 1;
  }

  return Math.max(0, (pageHeightMultiplier - 1) / transitionDistanceMultiplier);
};
