import type { GuessDto, RoomDto } from '../../src/features/rooms/types';

export function liveRoom(roomId: string) {
  return {
    id: roomId,
    language: 'IT',
    rounds: 5,
    status: 'IN_PROGRESS',
    rematchRequested: false,
    players: [
      { id: 'user-1', wins: 0, matchScore: 0, displayName: 'Alice Example' },
      { id: 'user-2', wins: 0, matchScore: 0, displayName: 'Bob Example' },
    ],
    currentRound: {
      roundNumber: 1,
      maxAttempts: 6,
      guesses: [] as GuessDto[],
      playerStatus: 'PLAYING',
      roundStatus: 'PLAYING',
    },
  } satisfies RoomDto;
}

export const winningGuess: GuessDto = {
  word: 'VERDE',
  attemptNumber: 1,
  letters: Array.from('VERDE', (letter) => ({ letter, status: 'CORRECT' })),
};
