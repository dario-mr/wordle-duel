import { Button, HStack } from '@chakra-ui/react';
import type { KeyboardRowLetters } from './layout';
import { LETTER_KEY_BUTTON_PROPS } from './styles';

export function KeyboardRow(props: {
  letters: KeyboardRowLetters;
  isBlocked: boolean;
  isWordFull: boolean;
  onPress: (letter: string) => void;
  wrap?: boolean;
}) {
  const keys = props.letters.map((letter) => (
    <Button
      key={letter}
      {...LETTER_KEY_BUTTON_PROPS}
      onClick={() => {
        props.onPress(letter);
      }}
      disabled={props.isBlocked || props.isWordFull}
    >
      {letter}
    </Button>
  ));

  if (props.wrap === false) {
    return <>{keys}</>;
  }

  return (
    <HStack gap={{ base: 0.5, md: 1 }} justify="center" w="100%">
      {keys}
    </HStack>
  );
}
