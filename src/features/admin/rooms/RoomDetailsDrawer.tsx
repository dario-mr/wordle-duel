import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Drawer,
  HStack,
  IconButton,
  Portal,
  Stack,
  Table,
  Text,
} from '@chakra-ui/react';
import { Check, Copy, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../shared/api/errors';
import { ErrorAlert } from '../../../shared/ui/ErrorAlert';
import { RoomLanguageFlag } from '../../rooms/shared/RoomLanguageFlag';
import { RoundTitle } from '../../rooms/shared/RoundTitle';
import type { RoundPlayerStatus } from '../../rooms/types';
import { useDeleteAdminRoomMutation } from './queries';
import type { AdminRoomDto, AdminRoomPlayerDto, AdminRoomRoundDto } from './types';

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
          <Drawer.Content bg="bg.card" w={{ base: 'full', md: '50rem' }} maxW="100vw">
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
            {room ? (
              <>
                <Drawer.Header
                  px={{ base: 4, md: 6 }}
                  py={4}
                  borderBottomWidth="1px"
                  borderColor="border.divider"
                >
                  <Stack gap={2} minW={0} pr={8}>
                    <HStack gap={2} flexWrap="wrap">
                      <Drawer.Title fontSize="xl" flex="none">
                        {t('admin.rooms.drawer.title')}
                      </Drawer.Title>
                      <CopyIdButton value={room.id} label={t('admin.rooms.drawer.copyRoomId')} />
                    </HStack>
                    <HStack gap={2} flexWrap="wrap" color="fg" fontSize="sm">
                      <RoundTitle roomStatus={room.status} statusOnly />
                      <RoomLanguageFlag language={room.language} fontSize="sm" />
                      <MetadataSeparator />
                      <Text>
                        {t(`admin.rooms.rounds.${String(room.configuredRounds)}`)}{' '}
                        {t('admin.rooms.columns.rounds')}
                      </Text>
                      <MetadataSeparator />
                      <Text>
                        {t('admin.rooms.drawer.createdAt')} {formatDate(room.createdAt)}
                      </Text>
                      <MetadataSeparator />
                      <Text>
                        {t('admin.rooms.drawer.lastUpdatedAt')} {formatDate(room.lastUpdatedAt)}
                      </Text>
                    </HStack>
                  </Stack>
                </Drawer.Header>
                <Drawer.Body px={{ base: 4, md: 6 }} py={5}>
                  <Stack gap={6}>
                    <Stack gap={3}>
                      <Text fontSize="lg" fontWeight="bold">
                        {t('admin.rooms.drawer.players')}
                      </Text>
                      {room.players.length === 0 ? (
                        <Text color="fg.muted">{t('admin.rooms.drawer.noPlayers')}</Text>
                      ) : (
                        <PlayerMatchup players={room.players} />
                      )}
                    </Stack>
                    <Stack gap={3}>
                      <Text fontSize="lg" fontWeight="bold">
                        {t('admin.rooms.drawer.rounds')}
                      </Text>
                      <RoundList room={room} />
                    </Stack>
                  </Stack>
                </Drawer.Body>
                <Drawer.Footer
                  px={{ base: 4, md: 6 }}
                  py={3}
                  borderTopWidth="1px"
                  borderColor="border.divider"
                  alignItems={{ base: 'stretch', sm: 'center' }}
                  justifyContent="flex-start"
                >
                  <DeleteRoomDialog room={room} onDeleted={props.onClose} />
                </Drawer.Footer>
              </>
            ) : null}
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

function MetadataSeparator() {
  return (
    <Text aria-hidden="true" color="fg.subtle">
      ·
    </Text>
  );
}

function PlayerMatchup({ players }: { players: AdminRoomPlayerDto[] }) {
  const { t } = useTranslation();
  const leftPlayer = players.at(0);
  const rightPlayer = players.at(1);
  const dash = t('room.playerStats.dash');

  return (
    <Box bg="bg.panel" borderRadius="xl" px={{ base: 4, md: 5 }} py={4}>
      <Box
        display="grid"
        gridTemplateColumns="minmax(0, 1fr) auto minmax(0, 1fr)"
        gap={{ base: 2, md: 4 }}
        alignItems="start"
      >
        <PlayerIdentity player={leftPlayer} alignment="left" dash={dash} />
        <Box aria-hidden="true" h="100%" borderLeftWidth="1px" borderColor="border.muted" />
        <PlayerIdentity player={rightPlayer} alignment="right" dash={dash} />
      </Box>
      <Box
        display="grid"
        gridTemplateColumns="minmax(0, 1fr) auto minmax(0, 1fr)"
        gap={{ base: 2, md: 4 }}
        alignItems="start"
        mt={4}
        pt={3}
        borderTopWidth="1px"
        borderColor="border.divider"
      >
        <PlayerRoundStats player={leftPlayer} alignment="left" dash={dash} />
        <HStack gap={{ base: 1, md: 2 }} align="center" minH="3.5rem">
          <Text fontSize="lg" fontWeight="bold" color="fg" whiteSpace="nowrap">
            {leftPlayer?.matchScore ?? dash}
          </Text>
          <Text aria-hidden="true" color="fg.subtle" fontSize="lg">
            —
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="fg" whiteSpace="nowrap">
            {rightPlayer?.matchScore ?? dash}
          </Text>
        </HStack>
        <PlayerRoundStats player={rightPlayer} alignment="right" dash={dash} />
      </Box>
    </Box>
  );
}

function PlayerIdentity(props: {
  player: AdminRoomPlayerDto | undefined;
  alignment: 'left' | 'right';
  dash: string;
}) {
  const { t } = useTranslation();
  const name = props.player?.displayName ?? props.dash;

  return (
    <Stack gap={1} minW={0} align={props.alignment === 'right' ? 'end' : 'start'}>
      <HStack gap={1} maxW="full" justify={props.alignment === 'right' ? 'end' : 'start'}>
        <Text
          minW={0}
          fontWeight="semibold"
          textAlign={props.alignment}
          overflowWrap="anywhere"
          title={props.player?.displayName ?? undefined}
        >
          {name}
        </Text>
        {props.player ? (
          <CopyIdButton value={props.player.id} label={t('admin.rooms.drawer.copyPlayerId')} />
        ) : null}
      </HStack>
    </Stack>
  );
}

function PlayerRoundStats(props: {
  player: AdminRoomPlayerDto | undefined;
  alignment: 'left' | 'right';
  dash: string;
}) {
  const { t } = useTranslation();

  return (
    <Stack
      gap={0}
      minH="3.5rem"
      justify="space-between"
      align={props.alignment === 'right' ? 'end' : 'start'}
    >
      <Text fontSize="sm" color="fg" opacity={0.75} fontWeight="medium" textAlign={props.alignment}>
        {t('admin.rooms.drawer.currentRound', {
          roundNumber: props.player?.currentRoundNumber ?? props.dash,
        })}
      </Text>
      <Text fontSize="sm" color="fg" opacity={0.75} fontWeight="medium" textAlign={props.alignment}>
        {props.player
          ? t('admin.rooms.drawer.playerWins', { count: props.player.wins })
          : props.dash}
      </Text>
    </Stack>
  );
}

function RoundList({ room }: { room: AdminRoomDto }) {
  const { t } = useTranslation();
  const dash = t('room.playerStats.dash');
  const leftPlayer = room.players.at(0);
  const rightPlayer = room.players.at(1);
  const roundNumbers = getRoundNumbers(room);
  const roundsByNumber = new Map(room.rounds.map((round) => [round.roundNumber, round]));

  if (roundNumbers.length === 0) {
    return <Text color="fg.muted">{t('admin.rooms.drawer.noRounds')}</Text>;
  }

  const playerName = (player: AdminRoomPlayerDto | undefined) => player?.displayName ?? dash;

  return (
    <Box overflowX="auto" overflowY="hidden" bg="bg.panel" borderRadius="xl">
      <Table.Root
        size="sm"
        width="full"
        minW={{ base: '34rem' }}
        tableLayout="fixed"
        css={{ '& tbody tr:last-child td': { borderBottomWidth: 0 } }}
      >
        <Table.Header>
          <Table.Row borderBottomWidth="1px" borderColor="border.muted">
            <RoundHeader label="#" width="3rem" />
            <RoundHeader label={t('room.round.solution')} width="7rem" />
            <RoundHeader label={playerName(leftPlayer)} />
            <RoundHeader label={playerName(rightPlayer)} />
            <RoundHeader label={t('admin.rooms.columns.status')} width="6rem" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {roundNumbers.map((roundNumber, index) => {
            const round = roundsByNumber.get(roundNumber);

            return (
              <Table.Row
                key={roundNumber}
                borderBottomWidth={index === roundNumbers.length - 1 ? 0 : '1px'}
                borderColor="border.divider"
                _hover={{ bg: 'bg.mutedCard' }}
              >
                <Table.Cell fontFamily="mono" color="fg.muted" verticalAlign="middle">
                  {roundNumber}
                </Table.Cell>
                <Table.Cell verticalAlign="middle">
                  <Text fontFamily="mono" fontWeight="semibold" letterSpacing="wide">
                    {round?.solution ?? dash}
                  </Text>
                </Table.Cell>
                <Table.Cell verticalAlign="middle">
                  <PlayerStatusValue status={round?.playerStatus[leftPlayer?.id ?? '']} />
                </Table.Cell>
                <Table.Cell verticalAlign="middle">
                  <PlayerStatusValue status={round?.playerStatus[rightPlayer?.id ?? '']} />
                </Table.Cell>
                <Table.Cell verticalAlign="middle">
                  <RoundStatusValue status={round?.roundStatus} />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}

function RoundHeader({ label, width }: { label: string; width?: string }) {
  return (
    <Table.ColumnHeader
      width={width}
      px={3}
      py={2}
      color="fg"
      opacity={0.8}
      fontSize="sm"
      fontWeight="semibold"
      textTransform="uppercase"
      letterSpacing="wide"
      overflowWrap="anywhere"
      title={label}
    >
      {label}
    </Table.ColumnHeader>
  );
}

function RoundStatusValue({ status }: { status: AdminRoomRoundDto['roundStatus'] | undefined }) {
  const { t } = useTranslation();

  return status ? (
    <StateValue
      label={t(`admin.rooms.drawer.roundStatus.${status}`)}
      kind={status === 'PLAYING' ? 'playing' : 'muted'}
    />
  ) : (
    <Text fontSize="sm" color="fg.subtle">
      {t('room.playerStats.dash')}
    </Text>
  );
}

function PlayerStatusValue({ status }: { status?: RoundPlayerStatus }) {
  const { t } = useTranslation();

  if (!status) {
    return (
      <Text fontSize="sm" color="fg.subtle">
        {t('room.playerStats.dash')}
      </Text>
    );
  }

  return (
    <StateValue
      label={t(`admin.rooms.drawer.playerStatus.${status}`)}
      kind={status === 'WON' ? 'success' : status === 'PLAYING' ? 'playing' : 'negative'}
    />
  );
}

function StateValue({
  label,
  kind,
}: {
  label: string;
  kind: 'success' | 'playing' | 'negative' | 'muted';
}) {
  const color =
    kind === 'success'
      ? 'fg.success'
      : kind === 'playing'
        ? 'yellow.400'
        : kind === 'negative'
          ? 'fg.subtle'
          : 'fg.muted';

  return (
    <HStack gap={1} color={color} whiteSpace="nowrap">
      {kind === 'success' ? <Check size={13} aria-hidden="true" /> : null}
      {kind === 'negative' ? <X size={13} aria-hidden="true" /> : null}
      {kind === 'playing' ? (
        <Box aria-hidden="true" boxSize="6px" borderRadius="full" bg={color} />
      ) : null}
      <Text fontSize="sm">{label}</Text>
    </HStack>
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
        <Button size="sm" variant="outline" colorPalette="red" borderRadius="md" flexShrink={0}>
          <Trash2 size={16} aria-hidden="true" />
          {t('admin.rooms.drawer.delete')}
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg="bg.card"
            borderWidth="1px"
            borderColor="border.divider"
            borderRadius="lg"
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
            {deleteRoomMutation.error ? (
              <Dialog.Body pt={0}>
                <ErrorAlert
                  title={t('admin.rooms.drawer.deleteFailedTitle')}
                  message={getErrorMessage(deleteRoomMutation.error)}
                />
              </Dialog.Body>
            ) : null}
            <Dialog.Footer gap={3} pt={4}>
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  bg="bg.keyboard"
                  borderRadius="md"
                  disabled={deleteRoomMutation.isPending}
                >
                  {t('admin.rooms.drawer.deleteCancel')}
                </Button>
              </Dialog.ActionTrigger>
              <Button
                colorPalette="red"
                borderRadius="md"
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

function getRoundNumbers(room: AdminRoomDto): number[] {
  if (room.configuredRounds === 'ENDLESS') {
    return room.rounds.map((round) => round.roundNumber).sort((left, right) => left - right);
  }

  return Array.from({ length: room.configuredRounds }, (_, index) => index + 1);
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function CopyIdButton({ value, label }: { value: string; label: string }) {
  return (
    <IconButton
      aria-label={label}
      title={label}
      variant="ghost"
      size="xs"
      onClick={() => void navigator.clipboard.writeText(value)}
    >
      <Copy aria-hidden="true" />
    </IconButton>
  );
}
