"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UseShoptetQueryOptions {
  endpoint: string;
  params?: Record<string, string | number | undefined>;
  enabled?: boolean;
}

function buildUrl(endpoint: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(endpoint, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export function useShoptetQuery<T = unknown>({ endpoint, params, enabled = true }: UseShoptetQueryOptions) {
  return useQuery<T>({
    queryKey: ['shoptet', endpoint, params],
    queryFn: async () => {
      const url = buildUrl(endpoint, params);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      return json.data ?? json;
    },
    enabled,
  });
}

interface UseShoptetSyncOptions {
  onSuccess?: () => void;
}

export function useShoptetSync({ onSuccess }: UseShoptetSyncOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (syncType: string) => {
      const res = await fetch('/api/shoptet/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: syncType }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Sync failed: ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoptet'] });
      onSuccess?.();
    },
  });
}
