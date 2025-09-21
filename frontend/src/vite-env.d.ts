/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENVIRONMENT: string
  readonly VITE_API_URL: string
  readonly VITE_DEBUG: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_ENABLE_DEBUG_PANEL: string
  readonly VITE_ENABLE_MOCK_DATA: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_CORS_ORIGIN: string
  readonly VITE_DEV_TOOLS: string
  readonly VITE_HOT_RELOAD: string
  readonly VITE_ENABLE_PERFORMANCE_MONITORING: string
  readonly VITE_ENABLE_ERROR_REPORTING: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
