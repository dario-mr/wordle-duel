import { Button } from '@chakra-ui/react';
import type { UsersSort, UsersSortField } from '../../admin/usersSorts';

interface SortHeaderButtonProps {
  label: string;
  field: UsersSortField;
  sort: UsersSort;
  onSortChange: (field: UsersSortField) => void;
}

export function SortHeaderButton({ label, field, sort, onSortChange }: SortHeaderButtonProps) {
  const indicator = sort?.field !== field ? '' : sort.direction === 'asc' ? ' ↑' : ' ↓';

  return (
    <Button
      variant="ghost"
      w="full"
      justifyContent="flex-start"
      px={2}
      _hover={{
        bg: 'bg.mutedCard',
      }}
      _focusVisible={{
        outline: 'none',
        boxShadow: 'inset 0 0 0 2px var(--chakra-colors-border-info)',
      }}
      onClick={() => {
        onSortChange(field);
      }}
    >
      {label}
      {indicator}
    </Button>
  );
}
