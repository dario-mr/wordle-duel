import { Code, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { RoomDto, RoundDto, RoundPlayerStatus } from '../../../api/types';
import { getErrorMessage } from '../../../api/errors';
import { ErrorAlert } from '../../common/ErrorAlert';
import { AccentButton } from '../../common/BrandButton.tsx';

export function RoundStatusPanel(props: {
  room: RoomDto;
  endedRound: RoundDto | null;
  myRoundStatus: RoundPlayerStatus | undefined;
  onReadyNextRound: (roundNumber: number) => void;
  isReadyPending: boolean;
  readyError: Error | null;
}) {
  const { t } = useTranslation();

  if (props.room.status !== 'IN_PROGRESS') {
    return <Text fontSize="sm">{t('room.round.notInProgressYet')}</Text>;
  }

  const endedRound = props.endedRound;
  const currentRound = props.room.currentRound;
  const solution = currentRound?.solution;

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
