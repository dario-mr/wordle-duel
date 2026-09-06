import { describe, expect, it } from 'vitest';
import { roomStatusColorByStatus } from '../../src/utils/roomStatusVisuals';

describe('roomStatusVisuals', () => {
  it('maps each room status to its shared color', () => {
    expect(roomStatusColorByStatus).toEqual({
      WAITING_FOR_PLAYERS: 'fg.muted',
      IN_PROGRESS: 'yellow.400',
      MATCH_FINISHED: 'fg.success',
    });
  });
});
