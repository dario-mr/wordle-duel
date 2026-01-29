import { Box, Flex, Link, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FOOTER_LINKS: { key: 'privacy' | 'cookies' | 'terms' | 'acceptableUse'; path: string }[] = [
  { key: 'privacy', path: '/privacy' },
  { key: 'cookies', path: '/cookies' },
  { key: 'terms', path: '/terms' },
  { key: 'acceptableUse', path: '/acceptable-use' },
];

function appHref(path: string): string {
  const base = import.meta.env.BASE_URL;
  const basePath = base === '/' ? '' : base.replace(/\/$/, '');
  return `${basePath}${path}`;
}

export function Footer() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Box as="footer" borderTopWidth="1px">
      <Flex
        maxW="container.md"
        mx="auto"
        py={3}
        px={4}
        align="center"
        justify="space-between"
        gap={3}
        wrap="wrap"
      >
        <Text fontSize="sm" opacity={0.75}>
          © {new Date().getFullYear()} {t('app.name')}
        </Text>

        <Flex gap={5} wrap="wrap" justify="flex-end">
          {FOOTER_LINKS.map((l) => (
            <Link
              key={l.path}
              href={appHref(l.path)}
              fontSize="sm"
              opacity={0.85}
              _hover={{ textDecoration: 'underline', opacity: 1 }}
              onClick={(e) => {
                e.preventDefault();
                void navigate(l.path);
              }}
            >
              {t(`footer.${l.key}`)}
            </Link>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
}
