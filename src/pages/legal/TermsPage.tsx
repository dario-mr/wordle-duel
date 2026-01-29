import { Heading, Stack, Text } from '@chakra-ui/react';
import { LEGAL } from './legalEnv';

export function TermsPage() {
  return (
    <Stack gap={4}>
      <Heading size="lg">Terms of Service</Heading>
      <Text fontSize="sm" opacity={0.8}>
        Effective date: {LEGAL.effectiveDate}
      </Text>

      <Stack gap={2}>
        <Heading size="md">1. Acceptance</Heading>
        <Text>
          By using the Service, you agree to these Terms. If you do not agree, do not use the
          Service.
        </Text>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">2. Accounts & Login</Heading>
        <Text>
          Login is provided via Google OAuth. You are responsible for maintaining control over your
          Google account.
        </Text>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">3. Rules</Heading>
        <Text>
          You must follow the Acceptable Use rules (including rules for display names and profile
          pictures shown from your Google profile).
        </Text>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">4. Availability</Heading>
        <Text>
          The Service is provided “as is” and may change, be interrupted, or be discontinued at any
          time.
        </Text>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">5. Disclaimer & Limitation of Liability</Heading>
        <Text>
          To the maximum extent permitted by law, the operator ({LEGAL.operatorName}) disclaims all
          warranties and is not liable for any indirect or consequential damages arising from your
          use of the Service.
        </Text>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">6. Termination</Heading>
        <Text>
          We may suspend or terminate access if you violate these Terms or for security reasons.
        </Text>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">7. Governing Law</Heading>
        <Text>
          These Terms are governed by the laws of {LEGAL.country} (excluding conflict-of-law rules).
        </Text>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">8. Contact</Heading>
        <Text>Contact: {LEGAL.contactEmail}.</Text>
      </Stack>
    </Stack>
  );
}
