import { describe, expect, it } from 'vitest';
import {
  getRoundPlayerIcon,
  getRoundStatusStyle,
  roomStatusStyleByStatus,
} from '../../src/utils/roomStatusVisuals';

describe('roomStatusVisuals', () => {
  it('maps each room status to the expected card/pill visuals', () => {
    expect(roomStatusStyleByStatus).toEqual({
      IN_PROGRESS: { borderLeftColor: 'green.600', pillBg: 'green.600', pillColor: 'white' },
      WAITING_FOR_PLAYERS: {
        borderLeftColor: 'yellow.400',
        pillBg: 'yellow.400',
        pillColor: 'black',
      },
      CLOSED: { borderLeftColor: 'gray.500', pillBg: 'gray.600', pillColor: 'white' },
    });
  });

  it('returns default round status visuals when no status is provided', () => {
    expect(getRoundStatusStyle(undefined)).toEqual({ pillBg: 'gray.600', pillColor: 'white' });
  });

  it('returns round status visuals for each known status', () => {
    expect(getRoundStatusStyle('PLAYING')).toEqual({ pillBg: 'blue.600', pillColor: 'white' });
    expect(getRoundStatusStyle('ENDED')).toEqual({ pillBg: 'gray.600', pillColor: 'white' });
  });

  it('returns default round player icon when no status is provided', () => {
    expect(getRoundPlayerIcon(undefined)).toEqual({ bg: 'gray.600', fg: 'gray.400', label: '?' });
  });

  it('returns round player icons for each known status', () => {
    expect(getRoundPlayerIcon('PLAYING')).toEqual({ bg: 'blue.600', fg: 'white', label: '▶' });
    expect(getRoundPlayerIcon('READY')).toEqual({ bg: 'green.600', fg: 'white', label: '✓' });
    expect(getRoundPlayerIcon('WON')).toEqual({ bg: 'yellow.500', fg: 'white', label: '★' });
    expect(getRoundPlayerIcon('LOST')).toEqual({ bg: 'red.600', fg: 'white', label: '✕' });
  });
});
