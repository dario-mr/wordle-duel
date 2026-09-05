import type { RoomStatus } from '../api/types';

export const roomStatusStyleByStatus = {
  IN_PROGRESS: { borderLeftColor: 'green.600', pillBg: 'blue.600', pillColor: 'white' },
  WAITING_FOR_PLAYERS: { borderLeftColor: 'yellow.400', pillBg: 'yellow.400', pillColor: 'black' },
  MATCH_FINISHED: { borderLeftColor: 'gray.500', pillBg: 'gray.600', pillColor: 'white' },
} satisfies Record<RoomStatus, RoomStatusStyle>;

interface RoomStatusStyle {
  borderLeftColor: string;
  pillBg: string;
  pillColor: string;
}
