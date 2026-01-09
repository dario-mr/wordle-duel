import { Box, type BoxProps } from '@chakra-ui/react';
import type { PropsWithChildren } from 'react';

type CardProps = PropsWithChildren<
  {
    borderLeftColor?: BoxProps['borderLeftColor'];
  } & Omit<BoxProps, 'borderLeftColor'>
>;

export function Card(props: CardProps) {
  const { borderLeftColor = 'fg.primary', children, ...rest } = props;

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderLeftWidth="4px"
      borderRadius="xl"
      bg="bg.card"
      borderLeftColor={borderLeftColor}
      boxShadow="sm"
      {...rest}
    >
      {children}
    </Box>
  );
}
