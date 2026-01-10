import { Heading, NativeSelect, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { getErrorMessage } from '../../api/errors';
import { LANGUAGE_OPTIONS } from '../../constants';
import { useCreateRoomMutation } from '../../query/roomQueries';
import { PrimaryButton } from '../common/BrandButton';
import { Card } from '../common/Card';
import { ErrorAlert } from '../common/ErrorAlert';

type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['value'];

export function CreateRoomCard(props: {
  getPlayerId: () => string;
  onCreated: (roomId: string) => void;
}) {
  const [language, setLanguage] = useState<LanguageCode>(LANGUAGE_OPTIONS[0].value);
  const createMutation = useCreateRoomMutation();

  return (
    <Card>
      <Stack
        as="form"
        gap={3}
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate(
            {
              playerId: props.getPlayerId(),
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
        <Heading size="md">Create room</Heading>

        {createMutation.error ? (
          <ErrorAlert title="Create room failed" message={getErrorMessage(createMutation.error)} />
        ) : null}

        <Stack gap={1} maxW="240px">
          <Text fontSize="sm" fontWeight="medium">
            Language
          </Text>
          <NativeSelect.Root>
            <NativeSelect.Field
              id="create-room-language"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value as LanguageCode);
              }}
              aria-label="Language"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
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
          Create room
        </PrimaryButton>
      </Stack>
    </Card>
  );
}
