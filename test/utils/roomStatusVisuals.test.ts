import { describe, expect, it } from 'vitest';
import { roomStatusStyleByStatus } from '../../src/utils/roomStatusVisuals';

describe('roomStatusVisuals', () => {
  it('maps each room status to the expected card/pill visuals', () => {
    expect(roomStatusStyleByStatus).toEqual({
      IN_PROGRESS: { borderLeftColor: 'green.600', pillBg: 'blue.600', pillColor: 'white' },
      WAITING_FOR_PLAYERS: {
        borderLeftColor: 'yellow.400',
        pillBg: 'yellow.400',
        pillColor: 'black',
      },
      CLOSED: { borderLeftColor: 'gray.500', pillBg: 'gray.600', pillColor: 'white' },
    });
  });
});
