/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_OPERATOR_NAME?: string;
  readonly VITE_PUBLIC_CONTACT_EMAIL?: string;
  readonly VITE_PUBLIC_EFFECTIVE_DATE?: string;
  readonly VITE_PUBLIC_COUNTRY?: string;
}
