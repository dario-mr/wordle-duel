import { Button, Code, Stack, Text } from '@chakra-ui/react';
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
  if (props.room.status !== 'IN_PROGRESS') {
    return <Text fontSize="sm">Game not in progress yet.</Text>;
  }

  if (props.endedRound) {
    const endedRound = props.endedRound;

    return (
      <Stack gap={2} align="center">
        <Text fontSize="sm">
          Round ended.
          {endedRound.solution ? (
            <>
              {' '}
              Solution: <Code>{endedRound.solution}</Code>
            </>
          ) : null}
        </Text>

        {props.myRoundStatus === 'READY' ? (
          <Text fontSize="sm">Waiting for opponent...</Text>
        ) : (
          <Button
            colorPalette="teal"
            loading={props.isReadyPending}
            disabled={props.isReadyPending}
            onClick={() => {
              props.onReadyNextRound(endedRound.roundNumber);
            }}
          >
            Ready for next round
          </Button>
        )}

        {props.readyError ? (
          <ErrorAlert title="Ready rejected" message={getErrorMessage(props.readyError)} />
        ) : null}
      </Stack>
    );
  }

  if (props.myRoundStatus && props.myRoundStatus !== 'PLAYING') {
    return (
      <Text fontSize="sm" textAlign="center">
        You {props.myRoundStatus.toLowerCase()} this round. Waiting for opponent...
      </Text>
    );
  }

  return null;
}
