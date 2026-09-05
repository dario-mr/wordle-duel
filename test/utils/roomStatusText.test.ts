import { describe, expect, it } from 'vitest';
import { roomStatusTextKey } from '../../src/utils/roomStatusText';

describe('roomStatusText', () => {
  it('maps each room status to the expected translation key', () => {
    expect(roomStatusTextKey).toEqual({
      WAITING_FOR_PLAYERS: 'room.status.waitingForPlayers',
      IN_PROGRESS: 'room.status.inProgress',
      MATCH_FINISHED: 'room.status.matchFinished',
    });
  });
});
