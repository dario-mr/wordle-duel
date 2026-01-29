import { Code, Heading, Stack, Text } from '@chakra-ui/react';
import { LEGAL } from './legalEnv';

export function CookiesPage() {
  return (
    <Stack gap={4}>
      <Heading size="lg">Cookies & Similar Storage</Heading>
      <Text fontSize="sm" opacity={0.8}>
        Effective date: {LEGAL.effectiveDate}
      </Text>

      <Stack gap={2}>
        <Heading size="md">Strictly Necessary Cookies</Heading>
        <Text>
          The Service uses only strictly necessary cookies for security and authentication:
        </Text>
        <Stack as="ul" ps={5} gap={1} listStyleType="disc">
          <Text as="li">
            <Code>WD-XSRF-TOKEN</Code> (readable by the browser): used for CSRF protection on unsafe
            requests.
          </Text>
          <Text as="li">
            Refresh token cookie (<Code>__Host-wd_refresh</Code>, HttpOnly): used to refresh your
            session securely. This cookie is not accessible via JavaScript.
          </Text>
        </Stack>
        <Text>Without these cookies, the Service cannot function correctly.</Text>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">Local Storage / Session Storage</Heading>
        <Text>We also use “similar technologies” in your browser:</Text>
        <Stack as="ul" ps={5} gap={1} listStyleType="disc">
          <Text as="li">
            <Code>localStorage</Code>: <Code>wd.locale</Code> (UI language) and{' '}
            <Code>wd.theme</Code> (light/dark theme), saved when you change them.
          </Text>
          <Text as="li">
            <Code>sessionStorage</Code>: <Code>wd.auth.returnTo</Code> (temporary navigation helper
            during login), cleared after use.
          </Text>
        </Stack>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">How To Control</Heading>
        <Text>
          You can delete cookies and site data from your browser settings. If you disable strictly
          necessary cookies, login and gameplay may stop working.
        </Text>
      </Stack>
    </Stack>
  );
}
