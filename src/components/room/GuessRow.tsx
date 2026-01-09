import { Box, HStack } from '@chakra-ui/react';
import { useMemo } from 'react';
import type { GuessLetterStatus } from '../../api/types';
import { WORD_LENGTH } from '../../constants';

export interface Cell {
  letter: string;
  status?: GuessLetterStatus;
}

export function GuessRow(props: { word: string; letters?: Cell[] }) {
  const letters = useMemo<Cell[]>(() => {
    if (props.letters?.length === WORD_LENGTH) {
      return props.letters;
    }
    return props.word
      .padEnd(WORD_LENGTH, ' ')
      .slice(0, WORD_LENGTH)
      .split('')
      .map((ch) => ({ letter: ch }));
  }, [props.letters, props.word]);

  return (
    <HStack gap={2} justify="center">
      {letters.map((l, idx) => (
        <LetterCell key={idx} letter={l.letter} status={l.status} />
      ))}
    </HStack>
  );
}

function LetterCell(props: { letter: string; status?: GuessLetterStatus }) {
  return (
    <Box
      w={12}
      h={12}
      borderWidth="1px"
      borderColor="gray.300"
      bg={props.status ? statusColor(props.status) : 'transparent'}
      color={props.status ? 'white' : 'inherit'}
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight="bold"
      borderRadius="md"
    >
      {props.letter}
    </Box>
  );
}

function statusColor(status: GuessLetterStatus): string {
  switch (status) {
    case 'CORRECT':
      return 'green.500';
    case 'PRESENT':
      return 'yellow.500';
    case 'ABSENT':
      return 'gray.600';
  }
}
