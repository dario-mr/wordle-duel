import { Separator, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { PlayerDto, RoomDto, RoundStatus } from '../../api/types';
import { type Cell, GuessRow } from './GuessRow';
import { PlayerStatsBar } from './PlayerStatsBar';

export function PlayerBoard(props: { player: PlayerDto; opponent?: PlayerDto; room: RoomDto }) {
  const { t } = useTranslation();

  const round = props.room.currentRound;
  const guesses = round?.guessesByPlayerId[props.player.id] ?? [];
  const maxAttempts = round?.maxAttempts ?? 6;

  const rows = Array.from({ length: maxAttempts }, (_, index) => {
    const guess = guesses.at(index);
    if (!guess) {
      return { key: `empty-${String(index)}`, word: '', letters: undefined as Cell[] | undefined };
    }
    return {
      key: `guess-${String(guess.attemptNumber)}`,
      word: guess.word,
      letters: guess.letters,
    };
  });

  const roundStatusLabel = (roundStatus: RoundStatus): string => {
    switch (roundStatus) {
      case 'PLAYING':
        return t('room.round.statusPlaying');
      case 'ENDED':
        return t('room.round.statusEnded');
    }
  };

  const roundNumberText =
    typeof round?.roundNumber === 'number' ? String(round.roundNumber) : t('room.playerStats.dash');

  const roundStatusSuffix = round?.roundStatus ? `(${roundStatusLabel(round.roundStatus)})` : '';

  return (
    <Stack gap={3} align="center">
      <Text fontWeight="bold">
        {t('room.round.title', { roundNumber: roundNumberText })} {roundStatusSuffix}
      </Text>
      <PlayerStatsBar player={props.player} opponent={props.opponent} room={props.room} />
      <Separator w="100%" />

      <Stack gap={2} align="center">
        {rows.map((row) => (
          <GuessRow key={row.key} word={row.word} letters={row.letters} />
        ))}
      </Stack>
    </Stack>
  );
}
