import { Heading, NativeSelect, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../api/errors';
import { LANGUAGE_OPTIONS } from '../../constants';
import { useCreateRoomMutation } from '../../query/roomQueries';
import { PrimaryButton } from '../common/BrandButton';
import { Card } from '../common/Card';
import { ErrorAlert } from '../common/ErrorAlert';

type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['value'];

export function CreateRoomCard(props: { onCreated: (roomId: string) => void }) {
  const { t } = useTranslation();
  const [language, setLanguage] = useState<LanguageCode>(LANGUAGE_OPTIONS[0].value);
  const createMutation = useCreateRoomMutation();
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const languageSelectorEnabled = LANGUAGE_OPTIONS.length > 1;

  return (
    <Card>
      <Stack
        as="form"
        gap={3}
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate(
            {
              language,
            },
            {
              onSuccess: (room) => {
                props.onCreated(room.id);
              },
            },
          );
        }}
      >
        <Heading size="md">{t('home.createRoom.title')}</Heading>

        {createMutation.error ? (
          <ErrorAlert
            title={t('home.createRoom.failedTitle')}
            message={getErrorMessage(createMutation.error)}
          />
        ) : null}

        <Stack gap={1} maxW="240px">
          <Text fontSize="sm" fontWeight="medium">
            {t('home.createRoom.roomLanguageLabel')}
          </Text>
          <NativeSelect.Root disabled={!languageSelectorEnabled}>
            <NativeSelect.Field
              id="create-room-language"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value as LanguageCode);
              }}
              aria-label={t('home.createRoom.roomLanguageAriaLabel')}
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
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
        >
          {t('home.createRoom.button')}
        </PrimaryButton>
      </Stack>
    </Card>
  );
}
