import { Box, Flex, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ProfileDialog } from '../navbar/ProfileDialog';

export function Navbar() {
  const navigate = useNavigate();

  return (
    <Box as="header" borderBottomWidth="1px">
      <Flex maxW="container.md" mx="auto" py={2} px={4} align="center" justify="space-between">
        <Heading
          size="md"
          cursor="pointer"
          _hover={{ textDecoration: 'underline' }}
          onClick={() => void navigate('/')}
        >
          Wordle Duel
        </Heading>

        <ProfileDialog />
      </Flex>
    </Box>
  );
}
