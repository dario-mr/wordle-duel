import { Code, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { RoomDto } from '../../../api/types';
import { getErrorMessage } from '../../../api/errors';
import { ErrorAlert } from '../../common/ErrorAlert';
import { PrimaryButton } from '../../common/BrandButton.tsx';

export function RoundStatusPanel(props: {
  room: RoomDto;
  onNextRound: () => void;
  isNextRoundPending: boolean;
  nextRoundError: unknown;
  onRematch: () => void;
  isRematchPending: boolean;
  isRematchWaiting: boolean;
  rematchError: unknown;
  onBackToHome: () => void;
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
  const result =
    currentRound?.playerStatus === 'WON' ? (
      <Stack gap={1} mb={3} align="center">
        <Text textAlign="center">{t('room.round.youWonThisRound')}</Text>
      </Stack>
    ) : currentRound?.playerStatus === 'LOST' ? (
      <Stack gap={1} mb={3} align="center">
        <Text textAlign="center">{t('room.round.youLostThisRound')}</Text>
        {currentRound.solution ? (
          <Text fontSize="sm">
            {t('room.round.solution')} <Code>{currentRound.solution}</Code>
          </Text>
        ) : null}
      </Stack>
    ) : null;

  if (props.room.status === 'MATCH_FINISHED') {
    return (
      <Stack gap={2} align="center" pt={2}>
        {currentRound?.playerStatus === 'LOST' ? result : null}
        <Stack gap={2} w="full" maxW="32rem">
          <PrimaryButton
            w="full"
            h="46px"
            size="lg"
            loading={props.isRematchPending}
            disabled={props.isRematchPending || props.isRematchWaiting}
            onClick={props.onRematch}
          >
            {t(props.isRematchWaiting ? 'room.round.waitingForOpponent' : 'room.round.playAgain')}
          </PrimaryButton>

          <PrimaryButton
            variant="outline"
            bg="transparent"
            color="fg.primary"
            h="46px"
            _hover={{ bg: 'transparent', textDecoration: 'underline' }}
            _active={{ bg: 'transparent' }}
            onClick={props.onBackToHome}
          >
            {t('room.round.backToHome')}
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
        <Text textAlign="center">{t('room.round.waitingForOpponent')}</Text>
      ) : (
        <>
          <PrimaryButton
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
