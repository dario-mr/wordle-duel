import type { RoomStatus, RoundPlayerStatus } from '../../api/types';

export const roomStatusStyleByStatus = {
  IN_PROGRESS: { borderLeftColor: 'green.600', pillBg: 'green.600', pillColor: 'white' },
  WAITING_FOR_PLAYERS: { borderLeftColor: 'yellow.400', pillBg: 'yellow.400', pillColor: 'black' },
  CLOSED: { borderLeftColor: 'gray.500', pillBg: 'gray.600', pillColor: 'white' },
} satisfies Record<RoomStatus, RoomStatusStyle>;

export function getRoundPlayerIcon(status: RoundPlayerStatus | undefined): RoundPlayerIcon {
  if (!status) {
    return DEFAULT_ROUND_PLAYER_ICON;
  }

  return ROUND_PLAYER_ICON_BY_STATUS[status];
}

const DEFAULT_ROUND_PLAYER_ICON: RoundPlayerIcon = {
  bg: 'gray.600',
  fg: 'gray.400',
  label: '?',
};

const ROUND_PLAYER_ICON_BY_STATUS = {
  PLAYING: { bg: 'blue.600', fg: 'white', label: '▶' },
  READY: { bg: 'green.600', fg: 'white', label: '✓' },
  WON: { bg: 'green.600', fg: 'white', label: '✓' },
  LOST: { bg: 'red.600', fg: 'white', label: '✕' },
} satisfies Record<RoundPlayerStatus, RoundPlayerIcon>;

interface RoomStatusStyle {
  borderLeftColor: string;
  pillBg: string;
  pillColor: string;
}

interface RoundPlayerIcon {
  bg: string;
  fg: string;
  label: string;
}
