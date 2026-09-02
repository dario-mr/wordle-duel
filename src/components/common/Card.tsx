import { Box, type BoxProps } from '@chakra-ui/react';
import type { PropsWithChildren } from 'react';

type CardProps = PropsWithChildren<BoxProps>;

export function Card(props: CardProps) {
  const { children, ...rest } = props;

  return (
    <Box p={4.5} borderWidth="1px" borderRadius="3xl" bg="bg.card" boxShadow="sm" {...rest}>
      {children}
    </Box>
  );
}
