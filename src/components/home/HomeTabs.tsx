import { Box, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export type HomeTab = 'create' | 'join';

export function HomeTabs(props: { activeTab: HomeTab; onTabChange: (tab: HomeTab) => void }) {
  const { t } = useTranslation();
  const tabs = [
    { value: 'create' as const, label: t('home.createRoom.title'), panelId: 'create-room-panel' },
    { value: 'join' as const, label: t('home.joinRoom.title'), panelId: 'join-room-panel' },
  ];

  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(2, minmax(0, 1fr))"
      gap="2px"
      p="1px"
      borderWidth="1px"
      borderColor="border.muted"
      borderRadius="full"
      bg="bg"
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = props.activeTab === tab.value;

        return (
          <Button
            key={tab.value}
            type="button"
            role="tab"
            id={`${tab.value}-room-tab`}
            aria-selected={isActive}
            aria-controls={tab.panelId}
            variant="plain"
            minH="2.5rem"
            px={4}
            borderRadius="full"
            fontWeight="semibold"
            bg={isActive ? 'fg.primary' : 'transparent'}
            color={isActive ? 'fg' : 'fg.muted'}
            _hover={{
              bg: isActive ? 'fg.primary' : 'bg.subtle',
              color: isActive ? 'fg' : 'fg',
            }}
            _active={{
              bg: isActive ? 'fg.primary' : 'bg.subtle',
              color: isActive ? 'fg' : 'fg',
            }}
            onClick={() => {
              props.onTabChange(tab.value);
            }}
          >
            {tab.label}
          </Button>
        );
      })}
    </Box>
  );
}
