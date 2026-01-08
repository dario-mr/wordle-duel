import {
  Avatar,
  Box,
  Button,
  Code,
  Dialog,
  Flex,
  Heading,
  NativeSelect,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../../state/playerStore';
import { type ThemeMode, useThemeStore } from '../../state/themeStore';

export function Navbar() {
  const navigate = useNavigate();

  const playerId = usePlayerStore((s) => s.playerId);
  const ensurePlayerId = usePlayerStore((s) => s.ensurePlayerId);

  const themeMode = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    if (!playerId) {
      ensurePlayerId();
    }
  }, [ensurePlayerId, playerId]);

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

        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button variant="ghost" p={0} minW="auto" aria-label="Open profile">
              <Avatar.Root size="sm" colorPalette="teal">
                <Avatar.Fallback name="You" />
                <Avatar.Image />
              </Avatar.Root>
            </Button>
          </Dialog.Trigger>

          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.CloseTrigger />
              <Dialog.Header>
                <Dialog.Title>Profile</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={4} align="start">
                  <Box>
                    <Text mb={2}>Your player ID:</Text>
                    <Code fontSize="sm">{playerId ?? '...'}</Code>
                  </Box>

                  <Box w="full">
                    <Text mb={2}>Theme</Text>
                    <NativeSelect.Root maxW="200px">
                      <NativeSelect.Field
                        value={themeMode}
                        onChange={(e) => {
                          setTheme(e.target.value as ThemeMode);
                        }}
                        aria-label="Theme"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                </Stack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </Flex>
    </Box>
  );
}
