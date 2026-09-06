import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Drawer,
  HStack,
  IconButton,
  Portal,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../api/errors';
import type { AdminRoomDto } from '../../../api/types';
import { useDeleteAdminRoomMutation } from '../../../query/adminQueries';
import { ErrorAlert } from '../../common/ErrorAlert';
import { RoomLanguageFlag } from '../../myrooms/RoomLanguageFlag';
import { RoomStatusBadge } from './RoomStatusBadge';

export function RoomDetailsDrawer(props: { room: AdminRoomDto | null; onClose: () => void }) {
  const { t } = useTranslation();
  const room = props.room;

  return (
    <Drawer.Root
      open={room !== null}
      onOpenChange={(details) => {
        if (!details.open) {
          props.onClose();
        }
      }}
      placement="end"
      size="xl"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="bg.card" w={{ base: 'full', md: '40rem' }} maxW="100vw">
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
            {room ? (
              <>
                <Drawer.Header
                  px={{ base: 5, md: 8 }}
                  py={6}
                  borderBottomWidth="1px"
                  borderColor="border.divider"
                >
                  <Stack gap={3} minW={0} pr={8}>
                    <HStack gap={3} flexWrap="wrap">
                      <Drawer.Title fontSize="xl" flex="none">
                        {t('admin.rooms.drawer.title')}
                      </Drawer.Title>
                      <RoomStatusBadge status={room.status} />
                    </HStack>
                    <Text
                      fontFamily="mono"
                      fontSize="sm"
                      color="fg"
                      opacity={0.6}
                      overflowWrap="anywhere"
                    >
                      {room.id}
                    </Text>
                  </Stack>
                  <DeleteRoomDialog room={room} onDeleted={props.onClose} />
                </Drawer.Header>
                <Drawer.Body px={5} py={6}>
                  <Stack gap={4}>
                    <Box
                      p={4}
                      borderRadius="2xl"
                      bg="bg.panel"
                      borderWidth="1px"
                      borderColor="border.divider"
                    >
                      <HStack gap={2} flexWrap="wrap">
                        <Text color="fg" fontWeight="medium">
                          {t(`admin.rooms.rounds.${String(room.rounds)}`)}{' '}
                          {t('admin.rooms.columns.rounds')} ·
                        </Text>
                        <HStack gap={1}>
                          <RoomLanguageFlag language={room.language} fontSize="lg" />
                          <Text color="fg" fontWeight="medium">
                            {t(`roomLanguage.${room.language.toLowerCase()}`)}
                          </Text>
                        </HStack>
                      </HStack>
                    </Box>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                      <RoomDetailsRow
                        label={t('admin.rooms.drawer.createdAt')}
                        value={formatDate(room.createdAt)}
                      />
                      <RoomDetailsRow
                        label={t('admin.rooms.drawer.lastUpdatedAt')}
                        value={formatDate(room.lastUpdatedAt)}
                      />
                    </SimpleGrid>
                    <Stack gap={4} mt={4}>
                      <Text fontSize="lg" fontWeight="bold">
                        {t('admin.rooms.drawer.players')}
                      </Text>
                      {room.players.length === 0 ? (
                        <Text color="fg">{t('admin.rooms.drawer.noPlayers')}</Text>
                      ) : (
                        room.players.map((player) => (
                          <Box
                            key={player.id}
                            p={4}
                            bg="bg.panel"
                            borderWidth="1px"
                            borderColor="border.divider"
                            borderRadius="2xl"
                          >
                            <Text fontWeight="semibold" fontSize="md">
                              {player.displayName ?? player.id}
                            </Text>
                            {player.displayName ? (
                              <Text
                                mt={1}
                                fontFamily="mono"
                                fontSize="sm"
                                color="fg"
                                opacity={0.6}
                                overflowWrap="anywhere"
                              >
                                {player.id}
                              </Text>
                            ) : null}
                            <Text mt={3} fontSize="sm" color="fg" fontWeight="medium">
                              {t('admin.rooms.drawer.playerScore', {
                                wins: player.wins,
                                score: player.matchScore ?? '—',
                              })}
                            </Text>
                          </Box>
                        ))
                      )}
                    </Stack>
                  </Stack>
                </Drawer.Body>
              </>
            ) : null}
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

function DeleteRoomDialog(props: { room: AdminRoomDto; onDeleted: () => void }) {
  const { t } = useTranslation();
  const deleteRoomMutation = useDeleteAdminRoomMutation();

  const handleDelete = () => {
    if (deleteRoomMutation.isPending) {
      return;
    }

    deleteRoomMutation.mutate(props.room.id, {
      onSuccess: props.onDeleted,
    });
  };

  return (
    <Dialog.Root
      onOpenChange={(details) => {
        if (details.open) {
          deleteRoomMutation.reset();
        }
      }}
    >
      <Dialog.Trigger asChild>
        <IconButton
          aria-label={t('admin.rooms.drawer.delete')}
          title={t('admin.rooms.drawer.delete')}
          variant="ghost"
          size="sm"
          color="fg.error"
          position="absolute"
          top="3"
          insetEnd="12"
          _hover={{ bg: 'bg.error' }}
        >
          <Trash2 aria-hidden="true" />
        </IconButton>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg="bg.card"
            borderWidth="1px"
            borderColor="border.divider"
            borderRadius="2xl"
            boxShadow="2xl"
            mx={4}
          >
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" disabled={deleteRoomMutation.isPending} />
            </Dialog.CloseTrigger>
            <Dialog.Header pb={3}>
              <HStack gap={3}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize={10}
                  borderRadius="full"
                  bg="bg.muted"
                  color="fg.error"
                  flexShrink={0}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </Box>
                <Dialog.Title fontSize="lg">{t('admin.rooms.drawer.deleteTitle')}</Dialog.Title>
              </HStack>
            </Dialog.Header>
            <Dialog.Body pt={0}>
              <Dialog.Description color="fg">
                {t('admin.rooms.drawer.deleteDescription')}
              </Dialog.Description>
              {deleteRoomMutation.error ? (
                <Box mt={4}>
                  <ErrorAlert
                    title={t('admin.rooms.drawer.deleteFailedTitle')}
                    message={getErrorMessage(deleteRoomMutation.error)}
                  />
                </Box>
              ) : null}
            </Dialog.Body>
            <Dialog.Footer gap={3} pt={4}>
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  bg="bg.keyboard"
                  borderRadius="xl"
                  disabled={deleteRoomMutation.isPending}
                >
                  {t('admin.rooms.drawer.deleteCancel')}
                </Button>
              </Dialog.ActionTrigger>
              <Button
                colorPalette="red"
                borderRadius="xl"
                loading={deleteRoomMutation.isPending}
                onClick={handleDelete}
              >
                {t('admin.rooms.drawer.deleteConfirm')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

function RoomDetailsRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={2} p={4} borderRadius="2xl" bg="bg.panel">
      <Text fontSize="sm" color="fg" opacity={0.7} fontWeight="semibold">
        {label}
      </Text>
      <Text fontWeight="medium">{value}</Text>
    </Stack>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
