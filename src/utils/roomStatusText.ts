import type { RoomStatus, RoundPlayerStatus, RoundStatus } from '../api/types';

export const roundPlayerStatusTextKey = {
  PLAYING: 'room.playerStats.statusPlaying',
  WON: 'room.playerStats.statusWon',
  LOST: 'room.playerStats.statusLost',
  READY: 'room.playerStats.statusReady',
} satisfies Record<RoundPlayerStatus, string>;

export const roundStatusTextKey = {
  PLAYING: 'room.round.statusPlaying',
  ENDED: 'room.round.statusEnded',
} satisfies Record<RoundStatus, string>;

export const roomStatusTextKey = {
  WAITING_FOR_PLAYERS: 'room.status.waitingForPlayers',
  IN_PROGRESS: 'room.status.inProgress',
  CLOSED: 'room.status.closed',
} satisfies Record<RoomStatus, string>;
