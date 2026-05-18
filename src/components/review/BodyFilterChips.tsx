import { useCallback } from 'react';
import { Category, CategoryList, CategoryListItem } from '@wanteddev/wds';
import type { BodyFilter, User } from '@/types';

interface BodyFilterChipsProps {
  currentUser: User;
  activeFilter: BodyFilter['type'];
  onFilterChange: (filter: BodyFilter) => void;
}

const FILTERS: BodyFilter[] = [
  { type: 'mine', label: '내 체형' },
  { type: 'size_slim', label: '슬림' },
  { type: 'size_large', label: '넉넉' },
  { type: 'height_160', label: '160대' },
  { type: 'height_170', label: '170대' },
  { type: 'height_180', label: '180대' },
];

export default function BodyFilterChips({
  activeFilter,
  onFilterChange,
}: BodyFilterChipsProps) {
  const handleValueChange = useCallback(
    (value: string) => {
      const filter = FILTERS.find(f => f.type === value);
      if (filter) onFilterChange(filter);
    },
    [onFilterChange],
  );

  return (
    <Category
      value={activeFilter}
      onValueChange={handleValueChange}
      disableScrollMoveOnChange
    >
      <CategoryList size="large" horizontalPadding verticalPadding>
        {FILTERS.map(filter => (
          <CategoryListItem key={filter.type} value={filter.type}>
            {filter.type === 'mine'
              ? `내 체형`
              : filter.label}
          </CategoryListItem>
        ))}
      </CategoryList>
    </Category>
  );
}
