import { describe, expect, it } from 'vitest';
import {
  roomStatusTextKey,
  roundPlayerStatusTextKey,
  roundStatusTextKey,
} from '../../src/utils/roomStatusText';

describe('roomStatusText', () => {
  it('maps each room status to the expected translation key', () => {
    expect(roomStatusTextKey).toEqual({
      WAITING_FOR_PLAYERS: 'room.status.waitingForPlayers',
      IN_PROGRESS: 'room.status.inProgress',
      CLOSED: 'room.status.closed',
    });
  });

  it('maps each round status to the expected translation key', () => {
    expect(roundStatusTextKey).toEqual({
      PLAYING: 'room.round.statusPlaying',
      ENDED: 'room.round.statusEnded',
    });
  });

  it('maps each round player status to the expected translation key', () => {
    expect(roundPlayerStatusTextKey).toEqual({
      PLAYING: 'room.playerStats.statusPlaying',
      WON: 'room.playerStats.statusWon',
      LOST: 'room.playerStats.statusLost',
      READY: 'room.playerStats.statusReady',
    });
  });
});
