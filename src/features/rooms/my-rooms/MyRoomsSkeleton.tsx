import { Box, Heading, Skeleton, Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../shared/ui/Card';

const MY_ROOMS_SKELETON_CARD_COUNT = 3;
const MY_ROOMS_SKELETON_SIZES = {
  title: { height: '28px', width: '12rem' },
  language: '24px',
  status: { height: '16px', width: '6rem' },
  score: { height: '24px', width: '5rem' },
  round: { height: '20px', width: '8rem' },
  wins: { height: '20px', width: '6rem' },
  playerNames: ['8rem', '6rem'],
  playerWins: { height: '24px', width: '1rem' },
} as const;

export function MyRoomsSkeleton() {
  const { t } = useTranslation();

  return (
    <Stack gap={4}>
      <Heading size="lg" textAlign="center">
        {t('myRooms.title')}
      </Heading>

      <Stack gap={4}>
        {Array.from({ length: MY_ROOMS_SKELETON_CARD_COUNT }).map((_, index) => (
          <MyRoomCardSkeleton key={index} />
        ))}
      </Stack>
    </Stack>
  );
}

function MyRoomCardSkeleton() {
  const sizes = MY_ROOMS_SKELETON_SIZES;

  return (
    <Card py={4}>
      <Stack gap={3} w="full">
        <Box w="full" display="flex" alignItems="center" justifyContent="space-between">
          <Skeleton height={sizes.title.height} width={sizes.title.width} borderRadius="md" />
          <Skeleton boxSize={sizes.language} borderRadius="md" />
        </Box>

        <Card boxShadow="none" borderRadius="2xl" bg="bg.panel" py={2.5}>
          <Stack gap={3} w="full">
            <Stack gap={1} align="center">
              <Skeleton height={sizes.status.height} width={sizes.status.width} />
              <Skeleton {...sizes.score} />
              <Skeleton height={sizes.round.height} width={sizes.round.width} />
            </Stack>
          </Stack>
        </Card>

        <Stack gap={2}>
          <Box
            mt={3}
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
            opacity={0.6}
          >
            <Skeleton {...sizes.wins} />
          </Box>
          <Box borderWidth="1px" borderStyle="dashed" borderColor="border.muted" borderRadius="xl">
            {sizes.playerNames.map((width, index) => (
              <Box
                key={width}
                px={3}
                py={2}
                borderBottomWidth={index === 0 ? '1px' : 0}
                borderStyle="dashed"
                borderColor="border.muted"
              >
                <Box
                  display="grid"
                  gridTemplateColumns="minmax(0, 1fr) 2.5rem"
                  alignItems="stretch"
                  gap={4}
                >
                  <Skeleton alignSelf="center" height={sizes.score.height} width={width} />
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderLeftWidth="1px"
                    borderStyle="dashed"
                    borderColor="border.muted"
                    pl={4}
                  >
                    <Skeleton {...sizes.playerWins} />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
}
