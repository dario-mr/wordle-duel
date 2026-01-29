import { Heading, Link, Stack, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { LEGAL } from './legalEnv';

export function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <Stack gap={4}>
      <Heading size="lg">Privacy Policy</Heading>
      <Text fontSize="sm" opacity={0.8}>
        Effective date: {LEGAL.effectiveDate}
      </Text>

      <Stack gap={2}>
        <Heading size="md">Who We Are</Heading>
        <Text>
          Data Controller for this Service: {LEGAL.operatorName}. Contact: {LEGAL.contactEmail}.
        </Text>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">What Data We Process</Heading>
        <Text>We process only what is needed to run the Service:</Text>
        <Stack as="ul" ps={5} gap={1} listStyleType="disc">
          <Text as="li">
            Google sign-in data: your Google account email address and a stable account identifier
            (used to create and maintain your user record). We also receive profile fields such as
            your name and profile picture URL.
          </Text>
          <Text as="li">
            Gameplay data: rooms you create/join and the selected language for the room;
            game-related events needed to run matches.
          </Text>
          <Text as="li">
            Technical/security data: IP address and server logs (as typically produced by
            hosting/infra), plus authentication/session tokens.
          </Text>
          <Text as="li">
            Preferences stored in the browser: UI language and theme (see Cookies & Similar
            Storage).
          </Text>
        </Stack>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">How We Use Data</Heading>
        <Stack as="ul" ps={5} gap={1} listStyleType="disc">
          <Text as="li">Provide the Service (login, creating/joining rooms, gameplay).</Text>
          <Text as="li">
            Maintain account state and secure sessions (including CSRF protection).
          </Text>
          <Text as="li">Prevent abuse and troubleshoot issues.</Text>
        </Stack>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">Legal Bases (GDPR)</Heading>
        <Stack as="ul" ps={5} gap={1} listStyleType="disc">
          <Text as="li">
            Contract (Art. 6(1)(b)): to provide the Service you request (account + gameplay).
          </Text>
          <Text as="li">
            Legitimate interests (Art. 6(1)(f)): security, fraud/abuse prevention, and ensuring the
            Service works reliably.
          </Text>
          <Text as="li">
            Legal obligation (Art. 6(1)(c)) where applicable (e.g., if required by law enforcement
            requests).
          </Text>
        </Stack>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">Sharing & Processors</Heading>
        <Text>We do not sell your data. We share data only as needed:</Text>
        <Stack as="ul" ps={5} gap={1} listStyleType="disc">
          <Text as="li">Hosting/Infrastructure provider(s) (EU cloud) to run the Service.</Text>
          <Text as="li">Google (as authentication provider) as part of the sign-in flow.</Text>
        </Stack>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">International Transfers</Heading>
        <Text>
          The Service is hosted in the EU. Your authentication provider (Google) may process data
          outside the EU under its own terms and transfer mechanisms. Check Google’s privacy
          documentation for details.
        </Text>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">Retention</Heading>
        <Text>
          We keep your user record while your account is active and as needed to operate the
          Service. Tokens/cookies expire automatically. Server logs are retained for 30 days as
          required for security and operations.
        </Text>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">Your Rights</Heading>
        <Text>
          Depending on your location (and in the EU/EEA under GDPR), you may have rights to access,
          rectify, delete, or restrict processing of your personal data, and to object to certain
          processing.
        </Text>
        <Text>
          To exercise rights, contact: {LEGAL.contactEmail}. You also have the right to lodge a
          complaint with your local supervisory authority.
        </Text>
      </Stack>

      <Stack gap={2}>
        <Heading size="md">Cookies & Similar Storage</Heading>
        <Text>
          See our{' '}
          <Link
            href={appHref('/cookies')}
            onClick={(e) => {
              e.preventDefault();
              void navigate('/cookies');
            }}
            textDecoration="underline"
          >
            Cookies Policy
          </Link>
          .
        </Text>
      </Stack>
    </Stack>
  );
}

function appHref(path: string): string {
  const base = import.meta.env.BASE_URL;
  const basePath = base === '/' ? '' : base.replace(/\/$/, '');
  return `${basePath}${path}`;
}
