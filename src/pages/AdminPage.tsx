import { Heading, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { DoorOpen, Users } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../auth/useCurrentUser';
import { Card } from '../components/common/Card';

export function AdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const me = useCurrentUser();
  const isAdmin = me?.roles.includes('ADMIN') ?? false;

  useEffect(() => {
    if (me && !isAdmin) {
      void navigate('/', { replace: true });
    }
  }, [me, isAdmin, navigate]);

  if (!me || !isAdmin) {
    return null;
  }

  return (
    <Stack gap={4}>
      <Heading size="lg" textAlign="center">
        {t('admin.title')}
      </Heading>
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
        <AdminLink
          icon={Users}
          label={t('admin.users.title')}
          description={t('admin.users.cardDescription')}
          onClick={() => void navigate('/users')}
        />
        <AdminLink
          icon={DoorOpen}
          label={t('admin.rooms.title')}
          description={t('admin.rooms.cardDescription')}
          onClick={() => void navigate('/rooms')}
        />
      </SimpleGrid>
    </Stack>
  );
}

function AdminLink(props: {
  icon: typeof Users;
  label: string;
  description: string;
  onClick: () => void;
}) {
  const Icon = props.icon;

  return (
    <Card as="button" textAlign="start" cursor="pointer" onClick={props.onClick}>
      <Stack gap={2}>
        <HStack gap={2}>
          <Icon aria-hidden="true" />
          <Heading size="md">{props.label}</Heading>
        </HStack>
        <Text color="fg.navigation">{props.description}</Text>
      </Stack>
    </Card>
  );
}
