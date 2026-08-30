import { Code, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { PlayerDto, RoomDto, RoundDto, RoundPlayerStatus } from '../../../api/types';
import { getErrorMessage } from '../../../api/errors';
import { ErrorAlert } from '../../common/ErrorAlert';
import { PrimaryButton } from '../../common/BrandButton.tsx';

export function RoundStatusPanel(props: {
  room: RoomDto;
  player: PlayerDto;
  opponent?: PlayerDto;
  endedRound: RoundDto | null;
  myRoundStatus: RoundPlayerStatus | undefined;
  onReadyNextRound: (roundNumber: number) => void;
  isReadyPending: boolean;
  readyError: Error | null;
  onPlayAgain: () => void;
  isPlayAgainPending: boolean;
  playAgainError: unknown;
  onBackToHome: () => void;
}) {
  const { t } = useTranslation();

  if (props.room.status === 'WAITING_FOR_PLAYERS') {
    return <Text fontSize="sm">{t('room.round.notInProgressYet')}</Text>;
  }

  const endedRound = props.endedRound;
  const currentRound = props.room.currentRound;
  const solution = currentRound?.solution;
  const isClosed = props.room.status === 'CLOSED';

  if (isClosed) {
    return (
      <Stack gap={2} align="center" pt={2}>
        <Stack gap={2} w="full" maxW="32rem">
          {/* TODO: "play again" should sync both players to start in the same new room */}
          <PrimaryButton
            w="full"
            h="46px"
            size="lg"
            loading={props.isPlayAgainPending}
            disabled={props.isPlayAgainPending}
            onClick={props.onPlayAgain}
          >
            {t('room.round.playAgain')}
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

          {props.playAgainError != null && (
            <ErrorAlert
              title={t('room.round.playAgainFailed')}
              message={getErrorMessage(props.playAgainError)}
            />
          )}
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack gap={2} align="center">
      {/* player status (WON/LOST/READY) */}
      {props.myRoundStatus && props.myRoundStatus !== 'PLAYING' && (
        <Text textAlign="center">{t(getEndedRoundTextKey(props.myRoundStatus))}</Text>
      )}

      {/* show solution as soon as player loses */}
      {solution && props.myRoundStatus === 'LOST' && (
        <Text fontSize="sm">
          {t('room.round.solution')} <Code>{solution}</Code>
        </Text>
      )}

      {/* ended round panel */}
      {endedRound && (
        <Stack gap={2} align="center">
          {props.myRoundStatus !== 'READY' && (
            <PrimaryButton
              loading={props.isReadyPending}
              disabled={props.isReadyPending}
              onClick={() => {
                props.onReadyNextRound(endedRound.roundNumber);
              }}
            >
              {t('room.round.readyForNextRound')}
            </PrimaryButton>
          )}

          {props.readyError && (
            <ErrorAlert
              title={t('room.round.readyRejected')}
              message={getErrorMessage(props.readyError)}
            />
          )}
        </Stack>
      )}
    </Stack>
  );
}

function getEndedRoundTextKey(status: RoundPlayerStatus): string {
  switch (status) {
    case 'WON':
      return 'room.round.youWonThisRound';
    case 'LOST':
      return 'room.round.youLostThisRound';
    case 'READY':
      return 'room.round.youReadyThisRound';
    default:
      // not relevant in this scenario (not playing)
      return '';
  }
}
