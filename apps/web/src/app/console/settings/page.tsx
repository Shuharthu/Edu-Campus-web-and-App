'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Devices, Flag, Trash } from '@phosphor-icons/react';
import { Badge, Button, Card, InlineError, Input } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth-context';

interface InstitutionData {
  id: string;
  name: string;
  shortName: string;
  domain: string;
  supportEmail: string;
  timezone: string;
  defaultCurrency: string;
}

interface FeatureFlagItem {
  id: string;
  key: string;
  enabled: boolean;
  description: string | null;
}

interface DeviceItem {
  id: string;
  platform: string;
  deviceName: string;
  lastSeenAt: string;
}

export default function SettingsPage() {
  const { api, me, hasPermission, refreshMe } = useAuth();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const instQuery = useQuery({
    queryKey: ['institution-current'],
    queryFn: () => api.adminGetInstitution<InstitutionData>(),
    enabled: hasPermission('institution_settings', 'view'),
  });

  const flagsQuery = useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => api.adminListFlags<FeatureFlagItem[]>(),
    enabled: hasPermission('institution_settings', 'view'),
  });

  const devicesQuery = useQuery({
    queryKey: ['devices'],
    queryFn: () => api.authDevices<DeviceItem[]>(),
  });

  const [instName, setInstName] = useState('');

  const updateInstMutation = useMutation({
    mutationFn: () =>
      api.adminUpdateInstitution({
        name: instName || instQuery.data?.name,
      }),
    onSuccess: () => {
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ['institution-current'] });
      refreshMe();
    },
    onError: (err) => setErrorMsg(err instanceof Error ? err.message : 'Update failed'),
  });

  const toggleFlagMutation = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      api.adminToggleFlag(key, { enabled }),
    onSuccess: () => {
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
    onError: (err) => setErrorMsg(err instanceof Error ? err.message : 'Unable to toggle flag'),
  });

  const revokeDeviceMutation = useMutation({
    mutationFn: (id: string) => api.authRevokeDevice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices'] }),
  });

  return (
    <div className="space-y-24">
      <div>
        <h1 className="heading-4 text-[var(--se-text-primary)]">Settings and devices</h1>
        <p className="body-6 mt-4 text-[var(--se-text-secondary)]">
          Manage institution configuration, feature flags and signed in devices.
        </p>
      </div>

      {errorMsg ? <InlineError message={errorMsg} /> : null}

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        {hasPermission('institution_settings', 'view') && instQuery.data ? (
          <Card className="space-y-16">
            <div className="flex items-center justify-between">
              <h2 className="title-2 text-[var(--se-text-primary)]">Institution profile</h2>
              <Badge tone="info">{me?.activeContext.roleTier}</Badge>
            </div>
            <div className="space-y-12">
              <div>
                <label className="caption-4 mb-4 block text-[var(--se-text-muted)]">
                  University name
                </label>
                <Input
                  defaultValue={instQuery.data.name}
                  onChange={(e) => setInstName(e.target.value)}
                  disabled={me?.activeContext.roleTier !== 'SUPER_ADMIN'}
                />
              </div>
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <p className="caption-4 text-[var(--se-text-muted)]">Domain</p>
                  <p className="body-5 tabular-mono mt-4 text-[var(--se-text-primary)]">
                    {instQuery.data.domain}
                  </p>
                </div>
                <div>
                  <p className="caption-4 text-[var(--se-text-muted)]">Currency</p>
                  <p className="body-5 tabular-mono mt-4 text-[var(--se-text-primary)]">
                    {instQuery.data.defaultCurrency}
                  </p>
                </div>
              </div>
              {me?.activeContext.roleTier === 'SUPER_ADMIN' ? (
                <Button size="sm" onClick={() => updateInstMutation.mutate()}>
                  Save institution settings
                </Button>
              ) : (
                <p className="caption-5 text-[var(--se-text-muted)]">
                  Only Super admin accounts can modify global institution settings.
                </p>
              )}
            </div>
          </Card>
        ) : null}

        <Card className="space-y-16">
          <div className="flex items-center justify-between">
            <h2 className="title-2 text-[var(--se-text-primary)]">Signed in devices</h2>
            <Devices size={18} className="text-brand-bright-teal" />
          </div>
          <div className="space-y-8">
            {(devicesQuery.data ?? []).map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] px-12 py-12"
              >
                <div>
                  <p className="body-5 text-[var(--se-text-primary)]">{d.deviceName}</p>
                  <p className="caption-5 tabular-mono text-[var(--se-text-muted)]">
                    {d.platform} · Last active {new Date(d.lastSeenAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="xsm"
                  variant="ghost"
                  aria-label={`Sign out ${d.deviceName}`}
                  onClick={() => revokeDeviceMutation.mutate(d.id)}
                >
                  <Trash size={14} />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {hasPermission('institution_settings', 'view') ? (
          <Card className="space-y-16 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="title-2 text-[var(--se-text-primary)]">Feature flags</h2>
              <Flag size={18} className="text-brand-amber" />
            </div>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              {(flagsQuery.data ?? []).map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-center justify-between gap-12 rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] p-12"
                >
                  <div>
                    <p className="body-5 tabular-mono text-[var(--se-text-primary)]">{flag.key}</p>
                    <p className="caption-5 mt-2 text-[var(--se-text-muted)]">
                      {flag.description ?? ''}
                    </p>
                  </div>
                  <Button
                    size="xsm"
                    variant={flag.enabled ? 'primary' : 'secondary'}
                    disabled={!hasPermission('institution_settings', 'edit')}
                    onClick={() =>
                      toggleFlagMutation.mutate({ key: flag.key, enabled: !flag.enabled })
                    }
                  >
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
