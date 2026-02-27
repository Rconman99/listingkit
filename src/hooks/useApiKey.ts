import { useAppStore } from '../store/appStore';

export function useApiKey() {
  const apiKey = useAppStore((s) => s.apiKey);
  const setApiKey = useAppStore((s) => s.setApiKey);
  const provider = useAppStore((s) => s.provider);
  const setProvider = useAppStore((s) => s.setProvider);

  return {
    apiKey,
    hasKey: apiKey.length > 0,
    setApiKey,
    provider,
    setProvider,
  };
}
