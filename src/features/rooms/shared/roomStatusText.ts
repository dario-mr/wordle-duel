import type { RoomStatus } from '../types';

export const roomStatusTextKey = {
  WAITING_FOR_PLAYERS: 'room.status.waitingForPlayers',
  IN_PROGRESS: 'room.status.inProgress',
  MATCH_FINISHED: 'room.status.matchFinished',
} satisfies Record<RoomStatus, string>;
