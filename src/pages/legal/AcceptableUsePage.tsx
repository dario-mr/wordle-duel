import { Heading, Stack, Text } from '@chakra-ui/react';
import { LEGAL } from './legalEnv';

export function AcceptableUsePage() {
  return (
    <Stack gap={4}>
      <Heading size="lg">Acceptable Use</Heading>
      <Text fontSize="sm" opacity={0.8}>
        Effective date: {LEGAL.effectiveDate}
      </Text>

      <Stack gap={2}>
        <Heading size="md">What’s Not Allowed</Heading>
        <Text>You must not use the Service to:</Text>
        <Stack as="ul" ps={5} gap={1} listStyleType="disc">
          <Text as="li">Use illegal, hateful, harassing, or discriminatory display names.</Text>
          <Text as="li">Impersonate others or misrepresent your identity.</Text>
          <Text as="li">Attempt to disrupt, abuse, or overload the Service.</Text>
        </Stack>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">Profile Names & Pictures</Heading>
        <Text>
          The Service may show your display name and profile picture from Google. You are
          responsible for ensuring they comply with these rules.
        </Text>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">Reporting</Heading>
        <Text>
          To report illegal content or abuse (e.g., an illegal display name), contact:{' '}
          {LEGAL.contactEmail}.
        </Text>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">Enforcement</Heading>
        <Text>
          We may remove access, hide a display name where possible, or suspend accounts for
          violations or security reasons.
        </Text>
      </Stack>
    </Stack>
  );
}
