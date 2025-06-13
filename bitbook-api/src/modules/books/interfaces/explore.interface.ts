export type ExploreLabel = 'arrived' | 'audiobooks' | 'highlights' | 'reading';

export enum ExploreLabelEnum {
  ARRIVED = 'arrived',
  AUDIOBOOKS = 'audiobooks',
  HIGHLIGHTS = 'highlights',
  READING = 'reading'
}

export interface Explore {
  id: ExploreLabel;
  label: string;
}

export const EXPLORE_LABELS: Record<ExploreLabel, Explore> = {
  arrived: {
    id: 'arrived',
    label: 'Acabaram de chegar'
  },
  audiobooks: {
    id: 'audiobooks',
    label: 'AudioBooks'
  },
  highlights: {
    id: 'highlights',
    label: 'Destaques'
  },
  reading: {
    id: 'reading',
    label: 'Continue sua leitura'
  }
} as const;

export const getExploreLabel = (exploreId: ExploreLabel): string => {
  return EXPLORE_LABELS[exploreId]?.label;
}; 