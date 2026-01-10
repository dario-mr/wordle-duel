import { Button, Code, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { RoomDto, RoundDto, RoundPlayerStatus } from '../../api/types';
import { getErrorMessage } from '../../api/errors';
import { ErrorAlert } from '../common/ErrorAlert';

export function RoundStatusPanel(props: {
  room: RoomDto;
  endedRound: RoundDto | null;
  myRoundStatus: RoundPlayerStatus | undefined;
  onReadyNextRound: (roundNumber: number) => void;
  isReadyPending: boolean;
  readyError: unknown;
}) {
  const { t } = useTranslation();

  if (props.room.status !== 'IN_PROGRESS') {
    return <Text fontSize="sm">{t('room.round.notInProgressYet')}</Text>;
  }

  if (props.endedRound) {
    const endedRound = props.endedRound;

    return (
      <Stack gap={2} align="center">
        <Text fontSize="sm">
          {t('room.round.ended')}
          {endedRound.solution ? (
            <>
              {' '}
              {t('room.round.solution')} <Code>{endedRound.solution}</Code>
            </>
          ) : null}
        </Text>

        {props.myRoundStatus === 'READY' ? (
          <Text fontSize="sm">{t('room.round.waitingForOpponent')}</Text>
        ) : (
          <Button
            colorPalette="teal"
            loading={props.isReadyPending}
            disabled={props.isReadyPending}
            onClick={() => {
              props.onReadyNextRound(endedRound.roundNumber);
            }}
          >
            {t('room.round.readyForNextRound')}
          </Button>
        )}

        {props.readyError ? (
          <ErrorAlert
            title={t('room.round.readyRejected')}
            message={getErrorMessage(props.readyError)}
          />
        ) : null}
      </Stack>
    );
  }

  if (props.myRoundStatus && props.myRoundStatus !== 'PLAYING') {
    const statusKey =
      props.myRoundStatus === 'WON'
        ? 'room.round.youWonThisRound'
        : props.myRoundStatus === 'LOST'
          ? 'room.round.youLostThisRound'
          : 'room.round.youReadyThisRound';

    return (
      <Text fontSize="sm" textAlign="center">
        {t(statusKey)}
      </Text>
    );
  }

  return null;
}
