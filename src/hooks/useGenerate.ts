import { useState, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { PropertyInput } from '../lib/types';

export function useGenerate() {
  const store = useAppStore();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = useCallback((property: PropertyInput): boolean => {
    const errors: Record<string, string> = {};
    if (!property.address.trim()) errors.address = 'Address is required';
    if (!property.city.trim()) errors.city = 'City is required';
    if (!property.state.trim()) errors.state = 'State is required';
    if (!property.zip.trim()) errors.zip = 'ZIP code is required';
    if (!property.listPrice.trim()) errors.listPrice = 'List price is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const generate = useCallback(async (property: PropertyInput) => {
    if (!validate(property)) return;
    await store.generate(property);
  }, [store, validate]);

  const regenerate = useCallback(async (outputKey: 'mls' | 'social' | 'email' | 'flyer' | 'video') => {
    await store.regenerateOutput(outputKey);
  }, [store]);

  return {
    generate,
    regenerate,
    isGenerating: store.isGenerating,
    progress: store.progress,
    progressLabel: store.progressLabel,
    results: store.results,
    error: store.error,
    validationErrors,
  };
}
