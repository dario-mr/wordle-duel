import { Avatar, Box, Button, Code, Dialog, NativeSelect, Stack, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import UserIcon from '../../assets/icons/user.svg?react';
import { usePlayerStore } from '../../state/playerStore';
import { type ThemeMode, useThemeStore } from '../../state/themeStore';

export function ProfileDialog() {
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
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="ghost" p={0} minW="auto" aria-label="Open profile">
          <Avatar.Root size="sm" colorPalette="teal">
            <Avatar.Fallback>
              <Box
                boxSize="full"
                p="2px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="gray.600"
                _dark={{ color: 'gray.200' }}
              >
                <UserIcon width="100%" height="100%" />
              </Box>
            </Avatar.Fallback>
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
  );
}
