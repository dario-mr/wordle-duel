import { Code, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { PlayerDto, RoomDto, RoundDto, RoundPlayerStatus } from '../../../api/types';
import { getErrorMessage } from '../../../api/errors';
import { ErrorAlert } from '../../common/ErrorAlert';
import { AccentButton } from '../../common/BrandButton.tsx';

export function RoundStatusPanel(props: {
  room: RoomDto;
  player: PlayerDto;
  opponent?: PlayerDto;
  endedRound: RoundDto | null;
  myRoundStatus: RoundPlayerStatus | undefined;
  onReadyNextRound: (roundNumber: number) => void;
  isReadyPending: boolean;
  readyError: Error | null;
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
      <Stack gap={2} align="center">
        <Text fontSize="lg" fontWeight="semibold">
          {t('room.round.gameOver')}
        </Text>
        <Text textAlign="center">
          {t(getMatchResultTextKey(props.player.score, props.opponent?.score))}
        </Text>
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
            <AccentButton
              loading={props.isReadyPending}
              disabled={props.isReadyPending}
              onClick={() => {
                props.onReadyNextRound(endedRound.roundNumber);
              }}
            >
              {t('room.round.readyForNextRound')}
            </AccentButton>
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

function getMatchResultTextKey(playerScore: number, opponentScore: number | undefined): string {
  if (opponentScore == null) {
    return 'room.round.matchComplete';
  }
  if (playerScore > opponentScore) {
    return 'room.round.youWonMatch';
  }
  if (playerScore < opponentScore) {
    return 'room.round.youLostMatch';
  }
  return 'room.round.matchDraw';
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
