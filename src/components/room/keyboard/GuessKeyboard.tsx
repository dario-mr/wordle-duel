import { Grid, Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { GuessLetterStatus } from '../../../api/types';
import { WORD_LENGTH } from '../../../constants';
import { ErrorAlert } from '../../common/ErrorAlert';
import { KeyboardKey } from './KeyboardKey';
import { KeyboardLetterKeys } from './KeyboardLetterKeys';
import { KeyboardRow } from './KeyboardRow';
import { ACTION_KEY_COL_SPAN, KEY_ROWS, KEYBOARD_TOTAL_COLUMNS } from './layout';
import { useGuessKeyboardInput } from './useGuessKeyboardInput';

export function GuessKeyboard(props: {
  value: string;
  disabled: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  letterStatusByLetter?: Partial<Record<string, GuessLetterStatus>>;
  onChange: (nextValue: string) => void;
  onSubmit: (word: string) => void;
  errorMessage?: string;
}) {
  const { t } = useTranslation();

  const { value, disabled, canSubmit, isSubmitting, onChange, onSubmit, errorMessage } = props;

  const { isBlocked, submit, backspace, appendLetter } = useGuessKeyboardInput({
    value,
    disabled,
    canSubmit,
    isSubmitting,
    onChange,
    onSubmit,
  });

  const isWordFull = value.length >= WORD_LENGTH;

  return (
    <Stack gap={3} w="100%">
      <Stack gap={1.5} w="100%" maxW="36rem" mx="auto">
        <KeyboardRow
          letters={KEY_ROWS[0]}
          isBlocked={isBlocked}
          isWordFull={isWordFull}
          letterStatusByLetter={props.letterStatusByLetter}
          onPress={appendLetter}
        />

        <KeyboardRow
          letters={KEY_ROWS[1]}
          isBlocked={isBlocked}
          isWordFull={isWordFull}
          letterStatusByLetter={props.letterStatusByLetter}
          onPress={appendLetter}
        />

        <Grid
          gap={{ base: 0.5, md: 1 }}
          justifyContent="center"
          templateColumns={`repeat(${String(KEYBOARD_TOTAL_COLUMNS)}, 1fr)`}
          w="100%"
        >
          {/* Enter button */}
          <KeyboardKey
            colSpan={ACTION_KEY_COL_SPAN}
            onClick={submit}
            disabled={isBlocked || !canSubmit}
            loading={isSubmitting}
          >
            {t('room.guess.enter')}
          </KeyboardKey>

          {/* 3rd keyboard row (letters) */}
          <KeyboardLetterKeys
            letters={KEY_ROWS[2]}
            isDisabled={isBlocked || isWordFull}
            letterStatusByLetter={props.letterStatusByLetter}
            onPress={appendLetter}
          />

          {/* Delete button */}
          <KeyboardKey
            colSpan={ACTION_KEY_COL_SPAN}
            onClick={backspace}
            disabled={isBlocked || value.length === 0}
          >
            ⌫
          </KeyboardKey>
        </Grid>
      </Stack>

      {errorMessage ? (
        <ErrorAlert title={t('room.guess.rejectedTitle')} message={errorMessage} />
      ) : null}
    </Stack>
  );
}
