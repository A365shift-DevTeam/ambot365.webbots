/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute origin of the .NET API, or '' to use the page's own origin. */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
