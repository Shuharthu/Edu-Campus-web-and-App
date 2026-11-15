'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Eye, Plus, ShieldCheck, Trash } from '@phosphor-icons/react';
import { Badge, Button, Card, EmptyState, InlineError, Input, Skeleton } from '@/components/ui/primitives';
import { useAuth } from '@/lib/auth-context';

interface PermissionItem {
  id: string;
  module: string;
  action: string;
  scopeLevel: string;
  code: string;
}

interface RoleItem {
  id: string;
  slug: string;
  name: string;
  tier: string;
  isSystemTemplate: boolean;
  description: string | null;
  permissions: Array<{ permission: PermissionItem }>;
  _count: { assignments: number };
}

interface AssignmentItem {
  id: string;
  scopeType: string;
  departmentCode: string | null;
  programCode: string | null;
  isActing: boolean;
  validTo: string | null;
  user: { id: string; fullName: string; email: string; mfaEnabled: boolean };
  role: { id: string; slug: string; name: string; tier: string };
  campus: { id: string; code: string; name: string } | null;
}

interface ApprovalItem {
  id: string;
  workflowType: string;
  targetEntityType: string;
  status: string;
  payloadSnapshot: Record<string, unknown>;
  requestedBy: { fullName: string; email: string };
  steps: Array<{
    id: string;
    stepOrder: number;
    requiredRoleSlug: string;
    decision: string;
    comment: string | null;
  }>;
}

export default function RolesAndPermissionsPage() {
  const { api, me, startPreview, hasPermission } = useAuth();
  const queryClient = useQueryClient();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'assignments' | 'approvals'>('matrix');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleSlug, setNewRoleSlug] = useState('');
  const [assignUserId, setAssignUserId] = useState('');
  const [assignScope, setAssignScope] = useState('department');
  const [assignDept, setAssignDept] = useState('CSE');
  const [assignActing, setAssignActing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.rbacListRoles<RoleItem[]>(),
  });

  const permissionsQuery = useQuery({
    queryKey: ['permissions'],
    queryFn: () => api.rbacListPermissions<PermissionItem[]>(),
  });

  const assignmentsQuery = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => api.rbacListUserRoles<AssignmentItem[]>(),
  });

  const usersQuery = useQuery({
    queryKey: ['users-directory'],
    queryFn: () =>
      api.rbacListUsers<Array<{ id: string; fullName: string; email: string }>>(),
  });

  const approvalsQuery = useQuery({
    queryKey: ['approvals'],
    queryFn: () => api.rbacListApprovals<ApprovalItem[]>(),
  });

  const roles = rolesQuery.data ?? [];
  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? roles[0] ?? null;

  const createRoleMutation = useMutation({
    mutationFn: () =>
      api.rbacCreateRole({
        slug: newRoleSlug.trim(),
        name: newRoleName.trim(),
        tier: 'SUB_ADMIN',
        permissionIds: [],
      }),
    onSuccess: () => {
      setNewRoleName('');
      setNewRoleSlug('');
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (err) => setErrorMsg(err instanceof Error ? err.message : 'Unable to create role'),
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      api.rbacAssignUserRole({
        userId: assignUserId || usersQuery.data?.[0]?.id || '',
        roleId: selectedRole?.id || '',
        scopeType: assignScope as 'department' | 'campus' | 'program' | 'section' | 'own' | 'institution',
        departmentCode: assignDept || undefined,
        isActing: assignActing,
        validTo: assignActing ? new Date(Date.now() + 14 * 86400_000).toISOString() : undefined,
      }),
    onSuccess: () => {
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    },
    onError: (err) => setErrorMsg(err instanceof Error ? err.message : 'Unable to assign role'),
  });

  const decideMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'APPROVED' | 'REJECTED' }) =>
      api.rbacDecideApproval(id, { decision }),
    onSuccess: () => {
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
    onError: (err) => setErrorMsg(err instanceof Error ? err.message : 'Approval update failed'),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.rbacRevokeAssignment(id),
    onSuccess: () => {
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    },
    onError: (err) => setErrorMsg(err instanceof Error ? err.message : 'Unable to revoke role'),
  });

  if (rolesQuery.isLoading) {
    return (
      <div className="space-y-16">
        <Skeleton className="h-40 w-1/3" />
        <Skeleton className="h-[360px] w-full rounded-2xl" />
      </div>
    );
  }

  const canPreview =
    me?.activeContext.roleTier === 'SUPER_ADMIN' || me?.activeContext.roleTier === 'ADMIN';

  return (
    <div className="space-y-24">
      <div className="flex flex-wrap items-start justify-between gap-16">
        <div>
          <h1 className="heading-4 text-[var(--se-text-primary)]">Roles and permissions</h1>
          <p className="body-6 mt-4 text-[var(--se-text-secondary)]">
            Configure scoped templates, acting delegations, approval chains and role previews.
          </p>
        </div>

        {selectedRole && canPreview ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => startPreview(selectedRole.id)}
          >
            <Eye size={16} />
            View as {selectedRole.name}
          </Button>
        ) : null}
      </div>

      {errorMsg ? <InlineError message={errorMsg} /> : null}

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        {/* Left Role Templates List */}
        <Card className="space-y-16 lg:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="title-3 text-[var(--se-text-primary)]">Role templates</h2>
            <Badge tone="neutral">{roles.length}</Badge>
          </div>

          <div className="space-y-4">
            {roles.map((role) => {
              const active = selectedRole?.id === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-12 py-8 text-left transition-colors duration-300 ${
                    active
                      ? 'border-brand-teal bg-[var(--se-bg-elevated)]'
                      : 'border-transparent hover:bg-[var(--se-bg-hover)]'
                  }`}
                >
                  <div>
                    <p className="body-5 text-[var(--se-text-primary)]">{role.name}</p>
                    <p className="caption-5 text-[var(--se-text-muted)]">{role.tier}</p>
                  </div>
                  <span className="caption-4 tabular-mono text-[var(--se-text-secondary)]">
                    {role._count.assignments}
                  </span>
                </button>
              );
            })}
          </div>

          {hasPermission('roles_permissions', 'create') ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createRoleMutation.mutate();
              }}
              className="space-y-8 border-t border-[var(--se-border)] pt-16"
            >
              <p className="caption-3 text-[var(--se-text-primary)]">New Sub admin role</p>
              <Input
                placeholder="Role name"
                value={newRoleName}
                onChange={(e) => {
                  setNewRoleName(e.target.value);
                  setNewRoleSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '_')
                      .replace(/^_|_$/g, ''),
                  );
                }}
                required
              />
              <Input
                placeholder="role_slug"
                value={newRoleSlug}
                onChange={(e) => setNewRoleSlug(e.target.value)}
                className="tabular-mono"
                required
              />
              <Button
                type="submit"
                size="sm"
                className="w-full"
                disabled={createRoleMutation.isPending}
              >
                <Plus size={16} />
                Create role template
              </Button>
            </form>
          ) : null}
        </Card>

        {/* Right Detail Panel */}
        <Card className="space-y-16 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-8 border-b border-[var(--se-border)] pb-12">
            <div>
              <h2 className="title-2 text-[var(--se-text-primary)]">
                {selectedRole?.name ?? 'Select a role'}
              </h2>
              <p className="caption-5 text-[var(--se-text-muted)]">
                {selectedRole?.description ?? ''}
              </p>
            </div>

            <div className="flex gap-8">
              <Button
                size="sm"
                variant={activeTab === 'matrix' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab('matrix')}
              >
                Permissions
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'assignments' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab('assignments')}
              >
                Assignments
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'approvals' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab('approvals')}
              >
                Approvals
              </Button>
            </div>
          </div>

          {activeTab === 'matrix' && selectedRole ? (
            <div className="space-y-12">
              <p className="caption-5 text-[var(--se-text-secondary)]">
                Showing active module, action and scope grants ({selectedRole.permissions.length} total of{' '}
                {permissionsQuery.data?.length ?? 0} canonical permissions).
              </p>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {selectedRole.permissions.map(({ permission }) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] px-12 py-8"
                  >
                    <div>
                      <p className="body-5 text-[var(--se-text-primary)]">
                        {permission.module.replace(/_/g, ' ')}
                      </p>
                      <p className="caption-5 text-[var(--se-text-muted)]">{permission.action}</p>
                    </div>
                    <Badge tone="success">{permission.scopeLevel}</Badge>
                  </div>
                ))}
                {selectedRole.permissions.length === 0 ? (
                  <div className="sm:col-span-2">
                    <EmptyState
                      icon={<ShieldCheck size={22} />}
                      title="No permissions attached yet"
                      description="Select or assign module scopes via the API or seed templates."
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {activeTab === 'assignments' ? (
            <div className="space-y-16">
              {hasPermission('roles_permissions', 'create') && selectedRole ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    assignMutation.mutate();
                  }}
                  className="grid grid-cols-1 gap-8 rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] p-12 sm:grid-cols-4"
                >
                  <select
                    aria-label="Select staff user"
                    value={assignUserId || usersQuery.data?.[0]?.id || ''}
                    onChange={(e) => setAssignUserId(e.target.value)}
                    className="body-6 min-h-[40px] rounded-lg border border-[var(--se-border)] bg-[var(--se-bg-card)] px-8 text-[var(--se-text-primary)]"
                  >
                    {(usersQuery.data ?? []).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Scope level"
                    value={assignScope}
                    onChange={(e) => setAssignScope(e.target.value)}
                    className="body-6 min-h-[40px] rounded-lg border border-[var(--se-border)] bg-[var(--se-bg-card)] px-8 text-[var(--se-text-primary)]"
                  >
                    <option value="campus">Campus scope</option>
                    <option value="department">Department scope</option>
                    <option value="program">Program scope</option>
                    <option value="section">Section scope</option>
                  </select>

                  <Input
                    value={assignDept}
                    onChange={(e) => setAssignDept(e.target.value)}
                    placeholder="Department (e.g. CSE)"
                  />

                  <div className="flex items-center gap-8">
                    <label className="caption-4 flex items-center gap-4 text-[var(--se-text-secondary)]">
                      <input
                        type="checkbox"
                        checked={assignActing}
                        onChange={(e) => setAssignActing(e.target.checked)}
                      />
                      Acting
                    </label>
                    <Button type="submit" size="sm" className="flex-1">
                      Assign
                    </Button>
                  </div>
                </form>
              ) : null}

              <div className="space-y-8">
                {(assignmentsQuery.data ?? []).map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-8 rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] px-12 py-12"
                  >
                    <div>
                      <p className="body-5 text-[var(--se-text-primary)]">
                        {a.user.fullName} · {a.role.name}
                      </p>
                      <p className="caption-5 text-[var(--se-text-muted)]">
                        {a.scopeType}
                        {a.departmentCode ? ` · ${a.departmentCode}` : ''}
                        {a.campus ? ` · ${a.campus.name}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-8">
                      {a.isActing ? <Badge tone="warning">Acting</Badge> : null}
                      {a.user.mfaEnabled ? <Badge tone="success">MFA on</Badge> : null}
                      {hasPermission('roles_permissions', 'delete') ? (
                        <Button
                          size="xsm"
                          variant="ghost"
                          aria-label={`Revoke ${a.role.name} for ${a.user.fullName}`}
                          onClick={() => revokeMutation.mutate(a.id)}
                        >
                          <Trash size={14} />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === 'approvals' ? (
            <div className="space-y-12">
              {(approvalsQuery.data ?? []).length === 0 ? (
                <EmptyState
                  icon={<Check size={22} />}
                  title="No approval requests"
                  description="Grade modifications and delegation approvals appear here."
                />
              ) : (
                (approvalsQuery.data ?? []).map((ap) => (
                  <div
                    key={ap.id}
                    className="rounded-xl border border-[var(--se-border)] bg-[var(--se-bg-elevated)] p-16"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-8">
                      <div>
                        <p className="body-4 text-[var(--se-text-primary)]">
                          {ap.workflowType.replace(/_/g, ' ')} · {ap.targetEntityType}
                        </p>
                        <p className="caption-5 text-[var(--se-text-muted)]">
                          Requested by {ap.requestedBy.fullName}
                        </p>
                      </div>
                      <Badge tone={ap.status === 'APPROVED' ? 'success' : ap.status === 'REJECTED' ? 'danger' : 'warning'}>
                        {ap.status}
                      </Badge>
                    </div>

                    <pre className="tabular-mono mt-12 overflow-x-auto rounded-lg border border-[var(--se-border)] bg-[var(--se-bg-card)] p-12 text-xs text-[var(--se-text-secondary)]">
                      {JSON.stringify(ap.payloadSnapshot, null, 2)}
                    </pre>

                    {ap.status === 'PENDING' && hasPermission('roles_permissions', 'approve') ? (
                      <div className="mt-12 flex gap-8">
                        <Button
                          size="sm"
                          onClick={() => decideMutation.mutate({ id: ap.id, decision: 'APPROVED' })}
                        >
                          Approve step
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => decideMutation.mutate({ id: ap.id, decision: 'REJECTED' })}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
