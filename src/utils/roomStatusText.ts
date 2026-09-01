import type { RoomStatus } from '../api/types';

export const roomStatusTextKey = {
  WAITING_FOR_PLAYERS: 'room.status.waitingForPlayers',
  IN_PROGRESS: 'room.status.inProgress',
  CLOSED: 'room.status.closed',
} satisfies Record<RoomStatus, string>;
