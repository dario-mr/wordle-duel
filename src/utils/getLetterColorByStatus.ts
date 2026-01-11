import type { GuessLetterStatus } from '../api/types';

export function getLetterColorByStatus(status: GuessLetterStatus): string {
  switch (status) {
    case 'CORRECT':
      return 'green.600';
    case 'PRESENT':
      return 'yellow.500';
    case 'ABSENT':
      return 'gray.600';
  }
}
