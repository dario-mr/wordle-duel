import { Button, HStack, Input, Stack } from '@chakra-ui/react';
import { WORD_LENGTH } from '../../constants';
import { normalizeGuess } from '../../utils/normalizeGuess';
import { ErrorAlert } from '../common/ErrorAlert';

export function GuessForm(props: {
  value: string;
  disabled: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  onChange: (nextValue: string) => void;
  onSubmit: (word: string) => void;
  errorMessage?: string;
}) {
  return (
    <Stack gap={3}>
      <HStack py={3}>
        <Input
          value={props.value}
          onChange={(e) => {
            props.onChange(normalizeGuess(e.target.value));
          }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') {
              return;
            }
            if (!props.canSubmit) {
              return;
            }
            e.preventDefault();
            props.onSubmit(normalizeGuess(props.value));
          }}
          placeholder="ABCDE"
          maxLength={WORD_LENGTH}
          disabled={props.disabled}
          autoCapitalize="characters"
          autoCorrect="off"
        />

        <Button
          colorPalette="teal"
          disabled={!props.canSubmit}
          loading={props.isSubmitting}
          onClick={() => {
            props.onSubmit(normalizeGuess(props.value));
          }}
        >
          Submit
        </Button>
      </HStack>

      {props.errorMessage ? (
        <ErrorAlert title="Guess rejected" message={props.errorMessage} />
      ) : null}
    </Stack>
  );
}
