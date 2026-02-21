import { Input, VStack } from '@chakra-ui/react';
import type { KeyboardEvent } from 'react';
import type { UsersFilterField } from '../../admin/usersFilters';
import type { UsersSort, UsersSortField } from '../../admin/usersSorts';
import { SortHeaderButton } from './SortHeaderButton';
import { USERS_HEADER_FILTER_SLOT_HEIGHT } from './usersTable.constants';

interface FilterHeaderProps {
  label: string;
  field: UsersFilterField;
  value: string;
  sort: UsersSort;
  onSortChange: (field: UsersSortField) => void;
  onFilterValueChange: (field: UsersFilterField, value: string) => void;
  onFilterApply: () => void;
}

export function FilterHeader({
  label,
  field,
  value,
  sort,
  onSortChange,
  onFilterValueChange,
  onFilterApply,
}: FilterHeaderProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    onFilterApply();
  };

  return (
    <VStack align="stretch" gap={1} py={2}>
      <SortHeaderButton label={label} field={field} sort={sort} onSortChange={onSortChange} />
      <Input
        value={value}
        onChange={(event) => {
          onFilterValueChange(field, event.target.value);
        }}
        onKeyDown={handleKeyDown}
        height={USERS_HEADER_FILTER_SLOT_HEIGHT}
        size="sm"
        borderWidth="1px"
        borderColor="border.emphasized"
        bg="bg.panel"
        transition="border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease"
        _hover={{
          borderColor: 'border.inverted',
          bg: 'bg',
        }}
        _focusVisible={{
          borderColor: 'border.info',
          boxShadow: 'none',
          outline: 'none',
          bg: 'bg',
        }}
        _focus={{
          borderColor: 'border.info',
          boxShadow: 'none',
          outline: 'none',
          bg: 'bg',
        }}
        aria-label={label}
      />
    </VStack>
  );
}
