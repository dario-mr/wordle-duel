import { Button, type ButtonProps } from '@chakra-ui/react';

const defaultHover = { filter: 'brightness(0.9)' };
const defaultActive = { filter: 'brightness(0.9)' };

export function PrimaryButton({ bg, color, _hover, _active, ...rest }: ButtonProps) {
  return (
    <Button
      bg={bg ?? 'fg.primary'}
      color={color ?? 'fg'}
      _hover={_hover ?? defaultHover}
      _active={_active ?? defaultActive}
      {...rest}
    />
  );
}

export function AccentButton({ bg, color, _hover, _active, ...rest }: ButtonProps) {
  return (
    <Button
      bg={bg ?? 'fg.accent'}
      color={color ?? 'fg'}
      _hover={_hover ?? defaultHover}
      _active={_active ?? defaultActive}
      {...rest}
    />
  );
}
