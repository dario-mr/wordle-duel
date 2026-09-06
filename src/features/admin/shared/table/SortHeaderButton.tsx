import { Button } from '@chakra-ui/react';

export function SortHeaderButton<TField extends string>({
  label,
  field,
  sort,
  onSortChange,
}: {
  label: string;
  field: TField;
  sort: { field: TField; direction: 'asc' | 'desc' } | null;
  onSortChange: (field: TField) => void;
}) {
  const indicator = sort?.field !== field ? '' : sort.direction === 'asc' ? ' ↑' : ' ↓';

  return (
    <Button
      variant="ghost"
      w="full"
      justifyContent="flex-start"
      px={2}
      _hover={{ bg: 'bg.mutedCard' }}
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
