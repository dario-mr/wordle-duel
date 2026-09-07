import { Box, type BoxProps } from '@chakra-ui/react';
import type { PropsWithChildren } from 'react';

type PillProps = PropsWithChildren<BoxProps>;

export function Pill(props: PillProps) {
  const { children, ...rest } = props;

  return (
    <Box
      px={3}
      py={1}
      borderRadius="full"
      fontWeight="bold"
      letterSpacing="wider"
      fontSize="xs"
      flexShrink={0}
      {...rest}
    >
      {children}
    </Box>
  );
}
