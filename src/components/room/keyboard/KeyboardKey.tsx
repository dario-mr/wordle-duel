import type { ButtonProps } from '@chakra-ui/react';
import { Button, GridItem } from '@chakra-ui/react';
import type { ReactNode } from 'react';

const KEY_BUTTON_PROPS = {
  size: { base: 'xs', sm: 'sm' },
  variant: 'subtle',
  w: '100%',
  minW: '0',
  px: { base: 0, sm: 2 },
  h: 14,
  minH: 14,
  fontSize: { base: 'md', sm: 'lg' },
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
} as const;

export function KeyboardKey(props: {
  colSpan: number;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  buttonProps?: ButtonProps;
}) {
  return (
    <GridItem colSpan={props.colSpan}>
      <Button
        {...KEY_BUTTON_PROPS}
        {...props.buttonProps}
        onClick={() => {
          tryHapticTap();
          props.onClick();
        }}
        disabled={props.disabled}
        loading={props.loading}
      >
        {props.children}
      </Button>
    </GridItem>
  );
}

function tryHapticTap(): void {
  if (!isLikelyMobileDevice()) {
    return;
  }
  if (typeof navigator.vibrate !== 'function') {
    return;
  }

  try {
    navigator.vibrate(10);
  } catch {
    // Ignore vibration failures (unsupported or blocked)
  }
}

function isLikelyMobileDevice(): boolean {
  return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
}
