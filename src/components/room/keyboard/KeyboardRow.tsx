import { Grid, GridItem } from '@chakra-ui/react';
import type { GuessLetterStatus } from '../../../api/types';
import { KeyboardLetterKeys } from './KeyboardLetterKeys';
import type { KeyboardRowLetters } from './layout';
import { KEYBOARD_TOTAL_COLUMNS, LETTER_KEY_COL_SPAN } from './layout';

export function KeyboardRow(props: {
  letters: KeyboardRowLetters;
  isBlocked: boolean;
  isWordFull: boolean;
  letterStatusByLetter?: Partial<Record<string, GuessLetterStatus>>;
  onPress: (letter: string) => void;
}) {
  const usedColumns = props.letters.length * LETTER_KEY_COL_SPAN;
  const remainingColumns = Math.max(0, KEYBOARD_TOTAL_COLUMNS - usedColumns);
  const leftSpacer = Math.floor(remainingColumns / 2);
  const rightSpacer = remainingColumns - leftSpacer;

  return (
    <Grid
      gap={{ base: 0.5, md: 1 }}
      justifyContent="center"
      templateColumns={`repeat(${String(KEYBOARD_TOTAL_COLUMNS)}, 1fr)`}
      w="100%"
    >
      {leftSpacer > 0 && <GridItem colSpan={leftSpacer} />}

      <KeyboardLetterKeys
        letters={props.letters}
        isDisabled={props.isBlocked || props.isWordFull}
        letterStatusByLetter={props.letterStatusByLetter}
        onPress={props.onPress}
      />

      {rightSpacer > 0 && <GridItem colSpan={rightSpacer} />}
    </Grid>
  );
}
