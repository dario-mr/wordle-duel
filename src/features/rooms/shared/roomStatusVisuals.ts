import type { RoomStatus } from '../types';

export const roomStatusColorByStatus = {
  WAITING_FOR_PLAYERS: 'fg.muted',
  IN_PROGRESS: 'yellow.400',
  MATCH_FINISHED: 'fg.success',
} satisfies Record<RoomStatus, string>;
