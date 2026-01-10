import type { GuessLetterStatus } from '../../../api/types';
import { getLetterColorByStatus } from '../../../utils/getLetterColorByStatus';
import { KeyboardKey } from './KeyboardKey';
import { LETTER_KEY_COL_SPAN } from './layout';

export function KeyboardLetterKeys(props: {
  letters: readonly string[];
  isDisabled: boolean;
  letterStatusByLetter?: Partial<Record<string, GuessLetterStatus>>;
  onPress: (letter: string) => void;
}) {
  return props.letters.map((letter) => {
    const status = props.letterStatusByLetter?.[letter];
    const statusBg = status ? getLetterColorByStatus(status) : undefined;

    return (
      <KeyboardKey
        key={letter}
        colSpan={LETTER_KEY_COL_SPAN}
        onClick={() => {
          props.onPress(letter);
        }}
        disabled={props.isDisabled}
        buttonProps={{
          bg: statusBg,
          color: status ? 'white' : undefined,
          _hover: statusBg ? { bg: statusBg } : undefined,
          _active: statusBg ? { bg: statusBg } : undefined,
        }}
      >
        {letter}
      </KeyboardKey>
    );
  });
}
