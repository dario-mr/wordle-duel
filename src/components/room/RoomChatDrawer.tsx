import {
  Box,
  Button,
  CloseButton,
  Drawer,
  HStack,
  IconButton,
  Portal,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { MessageCircleMore } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type PlayerDto,
  ROOM_MESSAGE_PRESETS,
  type RoomMessageDto,
  type RoomMessagePreset,
} from '../../api/types';

interface RoomChatDrawerProps {
  messages: RoomMessageDto[];
  players: PlayerDto[];
  myPlayerId: string;
  unreadCount: number;
  open: boolean;
  isLoading: boolean;
  isSending: boolean;
  isSendBlocked: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (preset: RoomMessagePreset) => void;
}

export function RoomChatDrawer({
  messages,
  players,
  myPlayerId,
  unreadCount,
  open,
  isLoading,
  isSending,
  isSendBlocked,
  onOpenChange,
  onSend,
}: RoomChatDrawerProps) {
  const { t } = useTranslation();
  const messageListRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const wasLoadingRef = useRef(isLoading);
  const placement = useBreakpointValue<'bottom' | 'end'>({ base: 'bottom', md: 'end' }) ?? 'bottom';
  const chatLabel =
    unreadCount > 0 ? t('room.chat.unread', { count: unreadCount }) : t('room.chat.open');

  const opponentName =
    players.find((player) => player.id !== myPlayerId)?.displayName ?? t('room.chat.opponent');

  useEffect(() => {
    const shouldAnimate = wasOpenRef.current && !wasLoadingRef.current;
    wasOpenRef.current = open;
    wasLoadingRef.current = isLoading;

    if (!open || isLoading) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTo({
          top: messageListRef.current.scrollHeight,
          behavior: shouldAnimate ? 'smooth' : 'auto',
        });
      }
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [messages, open, isLoading]);

  return (
    <Drawer.Root
      open={open}
      size="xl"
      onOpenChange={(details) => {
        onOpenChange(details.open);
      }}
      placement={placement}
    >
      <Box position="relative">
        <Drawer.Trigger asChild>
          <IconButton
            aria-label={chatLabel}
            variant="ghost"
            size="sm"
            color="fg.primary"
            css={{ '& > svg': { boxSize: '6' } }}
          >
            <MessageCircleMore aria-hidden="true" />
          </IconButton>
        </Drawer.Trigger>
        {unreadCount > 0 ? (
          <Box
            position="absolute"
            top="0"
            right="0"
            minW="4"
            h="4"
            px="0.5"
            borderRadius="full"
            bg="fg.primary"
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="2xs"
            fontWeight="bold"
            lineHeight="4"
            textAlign="center"
            pointerEvents="none"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Box>
        ) : null}
      </Box>

      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content
            bg="bg.card"
            h={{ base: '65dvh', md: '100dvh' }}
            w={{ base: '100%', md: '28rem' }}
            borderTopRadius={{ base: '3xl', md: 0 }}
          >
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" aria-label={t('common.close')} />
            </Drawer.CloseTrigger>
            <Drawer.Header py={3}>
              <Drawer.Title>{opponentName}</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body ref={messageListRef} overflowY="auto" scrollBehavior="auto">
              {isLoading ? (
                <Text color="fg.muted">{t('room.chat.loading')}</Text>
              ) : messages.length === 0 ? (
                <Text color="fg.muted">{t('room.chat.empty')}</Text>
              ) : (
                <Stack gap={2} aria-live="polite">
                  {messages.map((message, index) => {
                    const isMine = message.senderPlayerId === myPlayerId;
                    const isLatest = index === messages.length - 1;

                    return (
                      <Box
                        key={message.id}
                        display="flex"
                        justifyContent={isMine ? 'flex-end' : 'flex-start'}
                      >
                        <Box
                          maxW="85%"
                          px={3}
                          py={2}
                          bg={isMine ? 'fg.primary' : 'bg.subtle'}
                          color={isMine ? 'white' : 'fg'}
                          borderRadius="xl"
                          borderBottomRightRadius={isMine ? (isLatest ? 'sm' : 0) : 'xl'}
                          borderBottomLeftRadius={isMine ? 'xl' : isLatest ? 'sm' : 0}
                        >
                          <Text fontSize="sm">{t(`room.chat.presets.${message.preset}`)}</Text>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Drawer.Body>
            <Drawer.Footer borderTopWidth="1px" borderColor="border.divider">
              <Stack gap={2} w="full">
                <HStack gap={2} flexWrap="wrap">
                  {ROOM_MESSAGE_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      size="sm"
                      variant="outline"
                      bg="bg.subtle"
                      borderRadius="xl"
                      transition="background-color 0.2s ease"
                      _hover={{ bg: 'bg.keyboard' }}
                      disabled={isSending || isSendBlocked}
                      onClick={() => {
                        onSend(preset);
                      }}
                    >
                      {t(`room.chat.presets.${preset}`)}
                    </Button>
                  ))}
                </HStack>
                {isSendBlocked ? (
                  <Text color="fg.muted" fontSize="sm">
                    {t('room.chat.waitForOpponentReply')}
                  </Text>
                ) : null}
              </Stack>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
