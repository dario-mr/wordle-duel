import { Code, Stack, Text } from '@chakra-ui/react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import type { RoomDto } from '../../types';
import { getErrorMessage } from '../../../../shared/api/errors';
import { ErrorAlert } from '../../../../shared/ui/ErrorAlert';
import { PrimaryButton } from '../../../../shared/ui/BrandButton';

export function RoundStatusPanel(props: {
  room: RoomDto;
  matchResult: 'WON' | 'LOST' | 'DRAW' | null;
  onNextRound: () => void;
  isNextRoundPending: boolean;
  nextRoundError: unknown;
  onRematch: () => void;
  isRematchPending: boolean;
  isRematchWaiting: boolean;
  rematchError: unknown;
}) {
  const { t } = useTranslation();

  if (props.room.status === 'WAITING_FOR_PLAYERS') {
    return <Text fontSize="sm">{t('room.round.notInProgressYet')}</Text>;
  }

  const currentRound = props.room.currentRound;
  const playerStatus = currentRound?.playerStatus;
  const hasFinishedRound = playerStatus != null && playerStatus !== 'PLAYING';
  const isFinalRound =
    currentRound != null &&
    props.room.rounds !== 'ENDLESS' &&
    currentRound.roundNumber === props.room.rounds;
  const isMatchFinished = props.room.status === 'MATCH_FINISHED';
  const resultStatus = isMatchFinished ? props.matchResult : currentRound?.playerStatus;
  const result =
    resultStatus === 'DRAW' ? (
      <Stack gap={1} mb={3} align="center">
        <Text className="match-result" textAlign="center">
          {t('room.round.matchDraw')}
        </Text>
      </Stack>
    ) : resultStatus === 'WON' ? (
      <Stack gap={1} mb={3} align="center">
        <Text className="match-result" textAlign="center">
          {t(isMatchFinished ? 'room.round.youWonMatch' : 'room.round.youWonThisRound')}
        </Text>
      </Stack>
    ) : resultStatus === 'LOST' ? (
      <Stack gap={1} mb={3} align="center">
        <Text className="match-result" textAlign="center">
          {t(isMatchFinished ? 'room.round.youLostMatch' : 'room.round.youLostThisRound')}
        </Text>
        {currentRound?.solution ? (
          <Text className="match-solution" fontSize="sm">
            {t('room.round.solution')}:{' '}
            <Code fontSize="sm">
              {Array.from(currentRound.solution).map((letter, index) => (
                <span
                  key={index}
                  className="solution-letter"
                  style={{ display: 'inline-block', '--letter-index': index } as CSSProperties}
                >
                  {letter}
                </span>
              ))}
            </Code>
          </Text>
        ) : null}
      </Stack>
    ) : null;

  if (props.room.status === 'MATCH_FINISHED') {
    return (
      <Stack gap={2} align="center" pt={2}>
        {result}
        <Stack gap={2} w="full" maxW="32rem">
          <PrimaryButton
            className="match-play-again"
            w="full"
            h="46px"
            size="lg"
            loading={props.isRematchPending}
            disabled={props.isRematchPending || props.isRematchWaiting}
            onClick={props.onRematch}
          >
            {t(props.isRematchWaiting ? 'room.round.waitingForOpponent' : 'room.round.playAgain')}
          </PrimaryButton>

          {props.rematchError != null && (
            <ErrorAlert
              title={t('room.round.playAgainFailed')}
              message={getErrorMessage(props.rematchError)}
            />
          )}
        </Stack>
      </Stack>
    );
  }

  if (!currentRound) {
    return <Text textAlign="center">{t('room.round.waitingForOpponent')}</Text>;
  }

  if (!hasFinishedRound) {
    return null;
  }

  return (
    <Stack gap={2} align="center">
      {result}
      {isFinalRound ? (
        <Text className="round-action" textAlign="center">
          {t('room.round.waitingForOpponent')}
        </Text>
      ) : (
        <>
          <PrimaryButton
            className="round-action"
            loading={props.isNextRoundPending}
            disabled={props.isNextRoundPending}
            onClick={props.onNextRound}
          >
            {t('room.round.nextRound')}
          </PrimaryButton>
          {props.nextRoundError != null ? (
            <ErrorAlert
              title={t('room.round.nextRoundRejected')}
              message={getErrorMessage(props.nextRoundError)}
            />
          ) : null}
        </>
      )}
    </Stack>
  );
}
