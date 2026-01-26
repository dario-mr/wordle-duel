import { Box, type BoxProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

type RoundPlayerStatusIconProps = {
  bg: BoxProps['bg'];
  color: BoxProps['color'];
  label: ReactNode;
  boxSize?: BoxProps['boxSize'];
} & Omit<BoxProps, 'bg' | 'color' | 'children' | 'boxSize'>;

export function RoundPlayerStatusIcon(props: RoundPlayerStatusIconProps) {
  const { bg, color, label, boxSize = 6, ...rest } = props;

  return (
    <Box
      boxSize={boxSize}
      borderRadius="full"
      bg={bg}
      color={color}
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight="bold"
      {...rest}
    >
      {label}
    </Box>
  );
}
