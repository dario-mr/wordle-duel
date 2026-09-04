import { NativeSelect, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../api/errors';
import { LANGUAGE_OPTIONS, ROUND_OPTIONS } from '../../constants';
import { useCreateRoomMutation } from '../../query/roomQueries';
import { PrimaryButton } from '../common/BrandButton';
import { ErrorAlert } from '../common/ErrorAlert';

type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['value'];
type RoomRounds = (typeof ROUND_OPTIONS)[number]['value'];

export function CreateRoomForm(props: { onCreated: (roomId: string) => void }) {
  const { t } = useTranslation();
  const [language, setLanguage] = useState<LanguageCode>(LANGUAGE_OPTIONS[0].value);
  const [rounds, setRounds] = useState<RoomRounds>(ROUND_OPTIONS[0].value);
  const createMutation = useCreateRoomMutation();
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const languageSelectorEnabled = LANGUAGE_OPTIONS.length > 1;

  return (
    <Stack
      as="form"
      gap={0}
      w="full"
      h="full"
      onSubmit={(e) => {
        e.preventDefault();
        createMutation.mutate(
          {
            language,
            rounds,
          },
          {
            onSuccess: (room) => {
              props.onCreated(room.id);
            },
          },
        );
      }}
    >
      <Text color="fg" opacity={0.6} fontSize="md" mb={8} textAlign="center">
        {t('home.createRoom.description')}
      </Text>

      {createMutation.error ? (
        <ErrorAlert
          title={t('home.createRoom.failedTitle')}
          message={getErrorMessage(createMutation.error)}
        />
      ) : null}

      <Stack gap={2} w="full" mb={4}>
        <Text fontSize="sm" fontWeight="medium">
          {t('home.createRoom.roomLanguageLabel')}
        </Text>
        <NativeSelect.Root disabled={!languageSelectorEnabled} w="full">
          <NativeSelect.Field
            id="create-room-language"
            value={language}
            minH="3rem"
            borderRadius="0.9rem"
            fontSize="1.05rem"
            onChange={(e) => {
              setLanguage(e.target.value as LanguageCode);
            }}
            aria-label={t('home.createRoom.roomLanguageLabel')}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>
      </Stack>

      <Stack gap={2} w="full" mb={4}>
        <Text fontSize="sm" fontWeight="medium">
          {t('home.createRoom.roundsLabel')}
        </Text>
        <NativeSelect.Root w="full">
          <NativeSelect.Field
            id="create-room-rounds"
            value={rounds}
            minH="3rem"
            borderRadius="0.9rem"
            fontSize="1.05rem"
            onChange={(e) => {
              const selectedRounds = ROUND_OPTIONS.find(
                (option) => String(option.value) === e.target.value,
              )?.value;
              if (selectedRounds !== undefined) {
                setRounds(selectedRounds);
              }
            }}
          >
            {ROUND_OPTIONS.map((opt) => (
              <option key={String(opt.value)} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>
      </Stack>

      <PrimaryButton
        loading={createMutation.isPending}
        disabled={createMutation.isPending}
        type="submit"
        w="full"
        minH={'2rem'}
        mt="auto"
      >
        {t('home.createRoom.button')}
      </PrimaryButton>
    </Stack>
  );
}
