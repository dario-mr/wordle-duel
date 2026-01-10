import { Button, HStack, Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { WORD_LENGTH } from '../../../constants';
import { ErrorAlert } from '../../common/ErrorAlert';
import { KeyboardRow } from './KeyboardRow';
import { KEY_ROWS } from './layout';
import { ACTION_KEY_BUTTON_PROPS } from './styles';
import { useGuessKeyboardInput } from './useGuessKeyboardInput';

export function GuessKeyboard(props: {
  value: string;
  disabled: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
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
    <Stack gap={3} py={3} w="100%" px={{ base: 2, md: 0 }}>
      <Stack gap={2} w="100%" maxW="36rem" mx="auto">
        <KeyboardRow
          letters={KEY_ROWS[0]}
          isBlocked={isBlocked}
          isWordFull={isWordFull}
          onPress={appendLetter}
        />

        <KeyboardRow
          letters={KEY_ROWS[1]}
          isBlocked={isBlocked}
          isWordFull={isWordFull}
          onPress={appendLetter}
        />

        <HStack gap={{ base: 0.5, md: 1 }} justify="center" w="100%">
          <Button
            {...ACTION_KEY_BUTTON_PROPS}
            onClick={submit}
            disabled={isBlocked || !canSubmit}
            loading={isSubmitting}
          >
            {t('room.guess.enter')}
          </Button>

          <KeyboardRow
            letters={KEY_ROWS[2]}
            isBlocked={isBlocked}
            isWordFull={isWordFull}
            onPress={appendLetter}
            wrap={false}
          />

          <Button
            {...ACTION_KEY_BUTTON_PROPS}
            onClick={backspace}
            disabled={isBlocked || value.length === 0}
          >
            ⌫
          </Button>
        </HStack>
      </Stack>

      {errorMessage ? (
        <ErrorAlert title={t('room.guess.rejectedTitle')} message={errorMessage} />
      ) : null}
    </Stack>
  );
}
