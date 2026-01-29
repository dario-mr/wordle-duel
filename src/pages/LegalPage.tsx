import { Code, Heading, Link, Separator, Stack, Text } from '@chakra-ui/react';
import { LEGAL } from '../config/publicEnv';

export function LegalPage() {
  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <Heading size="xl">Legal & Policies</Heading>
        <Text fontSize="sm" opacity={0.8}>
          Effective date: {LEGAL.effectiveDate}
          <br />
          Operator: {LEGAL.operatorName}.
          <br />
          Contact:{' '}
          <Link href={`mailto:${LEGAL.contactEmail}`} textDecoration="underline">
            {LEGAL.contactEmail}
          </Link>
          .
        </Text>
      </Stack>

      <Stack as="section" gap={4} id="terms">
        <Heading size="lg">Terms of Service</Heading>

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
            Login is provided via Google OAuth. You are responsible for maintaining control over
            your Google account.
          </Text>
        </Stack>

        <Stack gap={2}>
          <Heading size="md">3. Rules</Heading>
          <Text>
            You must follow the Acceptable Use rules described below (including rules for display
            names and profile pictures shown from your Google profile).
          </Text>
        </Stack>

        <Stack gap={2}>
          <Heading size="md">4. Availability</Heading>
          <Text>
            The Service is provided "as is" and may change, be interrupted, or be discontinued at
            any time.
          </Text>
        </Stack>

        <Stack gap={2}>
          <Heading size="md">5. Disclaimer & Limitation of Liability</Heading>
          <Text>
            To the maximum extent permitted by law, the operator ({LEGAL.operatorName}) disclaims
            all warranties and is not liable for any indirect or consequential damages arising from
            your use of the Service.
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
            These Terms are governed by the laws of {LEGAL.country} (excluding conflict-of-law
            rules).
          </Text>
        </Stack>
      </Stack>

      <Separator />
      <Stack as="section" gap={4} id="privacy">
        <Heading size="lg">Privacy Policy</Heading>

        <Stack gap={2}>
          <Heading size="md">Who We Are</Heading>
          <Text>
            Data Controller for this Service: {LEGAL.operatorName}. Contact:{' '}
            <Link href={`mailto:${LEGAL.contactEmail}`} textDecoration="underline">
              {LEGAL.contactEmail}
            </Link>
            .
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
              Preferences stored in the browser: UI language and theme (see{' '}
              <Link href="#cookies" textDecoration="underline">
                Cookies & Storage
              </Link>
              ).
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
              Contract (<Code>Art. 6(1)(b)</Code>): to provide the Service you request (account +
              gameplay).
            </Text>
            <Text as="li">
              Legitimate interests (<Code>Art. 6(1)(f)</Code>): security, fraud/abuse prevention,
              and ensuring the Service works reliably.
            </Text>
            <Text as="li">
              Legal obligation (<Code>Art. 6(1)(c)</Code>) where applicable (e.g., if required by
              law enforcement requests).
            </Text>
          </Stack>
        </Stack>

        <Stack gap={2}>
          <Heading size="md">Sharing & Processors</Heading>
          <Text>We do not sell your data. We share data only as needed:</Text>
          <Stack as="ul" ps={5} gap={1} listStyleType="disc">
            <Text as="li">Hosting/Infrastructure provider (EU cloud) to run the Service.</Text>
            <Text as="li">Google (as authentication provider) as part of the sign-in flow.</Text>
          </Stack>
        </Stack>

        <Stack gap={2}>
          <Heading size="md">International Transfers</Heading>
          <Text>
            The Service is hosted in the EU. Your authentication provider (Google) may process data
            outside the EU under its own terms and transfer mechanisms. Check Google's privacy
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
            Depending on your location (and in the EU/EEA under GDPR), you may have rights to
            access, rectify, delete, or restrict processing of your personal data, and to object to
            certain processing.
          </Text>
          <Text>
            To exercise rights, contact:{' '}
            <Link href={`mailto:${LEGAL.contactEmail}`} textDecoration="underline">
              {LEGAL.contactEmail}
            </Link>
            . You also have the right to lodge a complaint with your local supervisory authority.
          </Text>
        </Stack>
      </Stack>

      <Separator />

      <Stack as="section" gap={4} id="cookies">
        <Heading size="lg">Cookies & Storage</Heading>

        <Stack gap={2}>
          <Heading size="md">Strictly Necessary Cookies</Heading>
          <Text>
            The Service uses only strictly necessary cookies for security and authentication:
          </Text>
          <Stack as="ul" ps={5} gap={1} listStyleType="disc">
            <Text as="li">
              <Code>WD-XSRF-TOKEN</Code>: used for CSRF protection on unsafe requests. This cookie
              is readable by the browser.
            </Text>
            <Text as="li">
              <Code>__Host-wd_refresh</Code>: used to refresh your session securely. This cookie is
              not accessible via JavaScript (HttpOnly).
            </Text>
          </Stack>
          <Text>Without these cookies, the Service cannot function correctly.</Text>
        </Stack>

        <Stack gap={2}>
          <Heading size="md">Local Storage / Session Storage</Heading>
          <Text>We also use "similar technologies" in your browser:</Text>
          <Stack as="ul" ps={5} gap={1} listStyleType="disc">
            <Text as="li">
              <Code>localStorage</Code>: <Code>wd.locale</Code> (UI language) and{' '}
              <Code>wd.theme</Code> (light/dark theme), saved when you change them.
            </Text>
            <Text as="li">
              <Code>sessionStorage</Code>: <Code>wd.auth.returnTo</Code> - temporary navigation
              helper during login, cleared after use.
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

      <Separator />

      <Stack as="section" gap={4} id="acceptable-use">
        <Heading size="lg">Acceptable Use</Heading>

        <Stack gap={2}>
          <Heading size="md">What's Not Allowed</Heading>
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
            <Link href={`mailto:${LEGAL.contactEmail}`} textDecoration="underline">
              {LEGAL.contactEmail}
            </Link>
            .
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
    </Stack>
  );
}
