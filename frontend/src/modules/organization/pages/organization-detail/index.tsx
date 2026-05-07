import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Iconify from '../../../core/components/iconify';
import { useRouter } from '../../../core/hooks/useRouter';
import { useAuth } from '../../../auth/hooks/useAuth';
import customAlert from '../../../core/utils/custom-alert';
import customConfirm from '../../../core/utils/custom-confirm';
import { useOrganization } from '../../hooks/useOrganization';
import {
  Organization,
  OrgMemberWithUser,
  OrganizationInvitation,
  OrgRole,
  useOrganizationsApi,
} from '../../api/organizationsApi';

const ROLE_LABELS: Record<OrgRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
};

const ROLE_STYLES: Record<OrgRole, string> = {
  OWNER: 'bg-sphere-primary-100 text-sphere-primary-800',
  ADMIN: 'bg-amber-100 text-amber-800',
  MEMBER: 'bg-sphere-grey-200 text-sphere-grey-700',
};

function OrgAvatar({ org, size = 48 }: { org: Organization; size?: number }) {
  if (org.avatar) {
    return (
      <img
        src={org.avatar}
        alt={org.displayName}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="flex items-center justify-center rounded-full bg-sphere-primary-800 text-white"
      style={{ width: size, height: size }}
    >
      <Iconify icon="mdi:domain" width={Math.round(size * 0.45)} />
    </span>
  );
}

function EditOrgModal({
  org,
  onClose,
  onSaved,
}: {
  org: Organization;
  onClose: () => void;
  onSaved: (updated: Organization) => void;
}) {
  const [displayName, setDisplayName] = useState(org.displayName);
  const [description, setDescription] = useState(org.description ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const { updateOrganization } = useOrganizationsApi();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateOrganization(org.id, {
      displayName,
      description: description || null,
    })
      .then((updated) => {
        onSaved(updated);
        onClose();
      })
      .catch((err: Error) => {
        customAlert(err.message);
        setIsSaving(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-sphere-grey-800">Edit Organization</h2>
          <button onClick={onClose} className="text-sphere-grey-400 hover:text-sphere-grey-700">
            <Iconify icon="mdi:close" width={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-sphere-grey-700">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={255}
              className="rounded-md border border-sphere-grey-300 px-3 py-2 text-sm outline-none focus:border-sphere-primary-500 focus:ring-1 focus:ring-sphere-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-sphere-grey-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              className="rounded-md border border-sphere-grey-300 px-3 py-2 text-sm outline-none focus:border-sphere-primary-500 focus:ring-1 focus:ring-sphere-primary-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-sphere-grey-300 px-4 py-2 text-sm font-semibold text-sphere-grey-700 hover:bg-sphere-grey-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-sphere-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-sphere-primary-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateSubOrgModal({
  parentId,
  onClose,
  onCreated,
}: {
  parentId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { createOrganization } = useOrganizationsApi();

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const slug = slugify(displayName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    createOrganization({
      name: slug,
      displayName: displayName.trim(),
      _parentId: parentId,
    })
      .then(() => {
        onCreated();
        onClose();
      })
      .catch((err: Error) => {
        customAlert(err.message);
        setIsSaving(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-sphere-grey-800">Create Sub-organization</h2>
          <button onClick={onClose} className="text-sphere-grey-400 hover:text-sphere-grey-700">
            <Iconify icon="mdi:close" width={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-sphere-grey-700">Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="My Sub Organization"
              required
              maxLength={255}
              className="rounded-md border border-sphere-grey-300 px-3 py-2 text-sm outline-none focus:border-sphere-primary-500 focus:ring-1 focus:ring-sphere-primary-500"
            />
            {displayName.trim() && (
              <p className="text-xs text-sphere-grey-400">
                Identifier: <span className="font-mono">{slug}</span>
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-sphere-grey-300 px-4 py-2 text-sm font-semibold text-sphere-grey-700 hover:bg-sphere-grey-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || slug.length < 3}
              className="rounded-md bg-sphere-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-sphere-primary-700 disabled:opacity-50"
            >
              {isSaving ? 'Creating...' : 'Create sub-organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberModal({
  orgId,
  onClose,
  onAdded,
}: {
  orgId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<OrgRole>('MEMBER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { lookupUserByUsername, addMember } = useOrganizationsApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await lookupUserByUsername(username.trim());
      await addMember(orgId, user.id, role);
      onAdded();
      onClose();
    } catch (err: any) {
      customAlert(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-sphere-grey-800">Add Member</h2>
          <button onClick={onClose} className="text-sphere-grey-400 hover:text-sphere-grey-700">
            <Iconify icon="mdi:close" width={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-sphere-grey-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="john-doe"
              required
              className="rounded-md border border-sphere-grey-300 px-3 py-2 text-sm outline-none focus:border-sphere-primary-500 focus:ring-1 focus:ring-sphere-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-sphere-grey-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as OrgRole)}
              className="rounded-md border border-sphere-grey-300 px-3 py-2 text-sm outline-none focus:border-sphere-primary-500 focus:ring-1 focus:ring-sphere-primary-500"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-sphere-grey-300 px-4 py-2 text-sm font-semibold text-sphere-grey-700 hover:bg-sphere-grey-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-sphere-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-sphere-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InviteModal({
  orgId,
  invitations,
  onClose,
  onRefresh,
}: {
  orgId: string;
  invitations: OrganizationInvitation[];
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { createInvitation, revokeInvitation } = useOrganizationsApi();

  const handleGenerate = () => {
    setIsGenerating(true);
    createInvitation(orgId)
      .then(() => onRefresh())
      .catch((err: Error) => customAlert(err.message))
      .finally(() => setIsGenerating(false));
  };

  const handleRevoke = (inv: OrganizationInvitation) => {
    customConfirm('Revoke this invitation? Members with this code will no longer be able to join.')
      .then(() =>
        revokeInvitation(orgId, inv.id)
          .then(() => onRefresh())
          .catch((err: Error) => customAlert(err.message))
      )
      .catch(() => {});
  };

  const handleCopy = (code: string) => {
    const joinUrl = `${window.location.origin}/orgs/join/${code}`;
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const activeInvitations = invitations.filter(
    (inv) => !inv.expiresAt || new Date(inv.expiresAt) > new Date()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-sphere-grey-800">Invite Members</h2>
          <button onClick={onClose} className="text-sphere-grey-400 hover:text-sphere-grey-700">
            <Iconify icon="mdi:close" width={20} />
          </button>
        </div>
        <p className="mb-4 text-sm text-sphere-grey-600">
          Share an invite link. Anyone with the link can join this organization as a member.
        </p>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-md bg-sphere-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-sphere-primary-700 disabled:opacity-50"
        >
          <Iconify icon="mdi:link-plus" width={18} />
          {isGenerating ? 'Generating...' : 'Generate new invite link'}
        </button>

        {activeInvitations.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-sphere-grey-500">
              Active invitations
            </p>
            {activeInvitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-2 rounded-lg border border-sphere-grey-200 bg-sphere-grey-50 px-3 py-2"
              >
                <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm text-sphere-grey-700">
                  {inv.code}
                </code>
                <span className="text-xs text-sphere-grey-500">
                  {inv.useCount} use{inv.useCount !== 1 ? 's' : ''}
                  {inv.expiresAt && (
                    <> · expires {new Date(inv.expiresAt).toLocaleDateString()}</>
                  )}
                </span>
                <button
                  onClick={() => handleCopy(inv.code)}
                  title="Copy invite link"
                  className="text-sphere-grey-400 hover:text-sphere-primary-700"
                >
                  <Iconify
                    icon={copiedCode === inv.code ? 'mdi:check' : 'mdi:content-copy'}
                    width={16}
                  />
                </button>
                <button
                  onClick={() => handleRevoke(inv)}
                  title="Revoke invitation"
                  className="text-sphere-grey-400 hover:text-red-600"
                >
                  <Iconify icon="mdi:trash-can-outline" width={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeInvitations.length === 0 && (
          <p className="text-center text-sm text-sphere-grey-400">No active invitations.</p>
        )}
      </div>
    </div>
  );
}

type Tab = 'overview' | 'members' | 'invitations' | 'children';

export default function OrganizationDetailPage() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { authUser } = useAuth();
  const router = useRouter();
  const { isLoading: isOrgLoading } = useOrganization();

  const [org, setOrg] = useState<Organization | null>(null);
  const [myRole, setMyRole] = useState<OrgRole | null>(null);
  const [members, setMembers] = useState<OrgMemberWithUser[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [childAccessMap, setChildAccessMap] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createSubOrgModalOpen, setCreateSubOrgModalOpen] = useState(false);

  const {
    getOrganization,
    getOrgMembers,
    listInvitations,
    updateMemberRole,
    removeMember,
    revokeInvitation,
  } = useOrganizationsApi();

  const canManage = myRole === 'OWNER' || myRole === 'ADMIN';

  const loadOrgData = useCallback(async () => {
    if (!authUser.user?.id || !organizationId) return;

    try {
      const orgData = await getOrganization(organizationId);
      setOrg(orgData);

      const membersData = await getOrgMembers(organizationId);
      setMembers(membersData);

      const memberEntry = membersData.find((m) => m.user.id === authUser.user?.id);
      const userRole = memberEntry?.role ?? null;
      if (userRole) {
        setMyRole(userRole);
      }

      const invitationsData = (userRole === 'OWNER' || userRole === 'ADMIN')
        ? await listInvitations(organizationId)
        : [];
      setInvitations(invitationsData);

      const children = orgData.subOrganizations ?? [];
      if (userRole === 'OWNER' || userRole === 'ADMIN') {
        const map: Record<string, boolean> = {};
        for (const child of children) {
          map[child.id] = true;
        }
        setChildAccessMap(map);
      } else {
        const results = await Promise.allSettled(
          children.map(async (child) => {
            await getOrganization(child.id);
            return { id: child.id, ok: true };
          })
        );
        const map: Record<string, boolean> = {};
        children.forEach((child, i) => {
          map[child.id] = results[i].status === 'fulfilled';
        });
        setChildAccessMap(map);
      }
    } catch (err: any) {
      setError(err.message ?? 'Failed to load organization');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, authUser.user?.id]);

  const refreshMembers = useCallback(async () => {
    if (!org) return;
    try {
      const data = await getOrgMembers(org.id);
      setMembers(data);
    } catch {
      // silently ignore
    }
  }, [org, getOrgMembers]);

  const refreshInvitations = useCallback(async () => {
    if (!org) return;
    try {
      const data = await listInvitations(org.id);
      setInvitations(data);
    } catch {
      // silently ignore
    }
  }, [org, listInvitations]);

  useEffect(() => {
    if (authUser.isLoading || isOrgLoading) return;
    if (!authUser.isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!organizationId) return;
    loadOrgData();
  }, [authUser.isLoading, authUser.isAuthenticated, isOrgLoading, organizationId]);

  const handleRemoveMember = (member: OrgMemberWithUser) => {
    customConfirm(`Remove @${member.user.username} from this organization?`)
      .then(() =>
        removeMember(org!.id, member.user.id)
          .then(() => refreshMembers())
          .catch((err: Error) => customAlert(err.message))
      )
      .catch(() => {});
  };

  const handleRoleChange = async (member: OrgMemberWithUser, newRole: OrgRole) => {
    updateMemberRole(org!.id, member.user.id, newRole)
      .then(() => refreshMembers())
      .catch((err: Error) => customAlert(err.message));
  };

  if (isLoading || isOrgLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="text-sphere-grey-500">Loading...</span>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? 'Organization not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <button
          type="button"
          onClick={() => router.push('/me/orgs')}
          className="mt-1 text-sphere-grey-400 hover:text-sphere-grey-700"
        >
          <Iconify icon="mdi:arrow-left" width={20} />
        </button>

        <OrgAvatar org={org} size={64} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-sphere-grey-800">{org.displayName}</h1>
            {myRole && (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ROLE_STYLES[myRole]}`}>
                {ROLE_LABELS[myRole]}
              </span>
            )}
          </div>
          <p className="text-sm text-sphere-grey-500">@{org.name}</p>
          {org.description && (
            <p className="mt-1 max-w-2xl text-sm text-sphere-grey-600">{org.description}</p>
          )}
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setEditModalOpen(true)}
            className="flex items-center gap-1 rounded-md border border-sphere-grey-300 px-3 py-1.5 text-sm font-semibold text-sphere-grey-700 hover:bg-sphere-grey-100"
          >
            <Iconify icon="mdi:pencil-outline" width={16} />
            Edit
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-sphere-grey-200">
        {(['overview', 'members', 'invitations', 'children'] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-sphere-primary-800 text-sphere-primary-800'
                : 'text-sphere-grey-500 hover:text-sphere-grey-700'
            }`}
          >
            {tab === 'children' ? 'Sub-organizations' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-sphere-grey-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-sphere-grey-500">Members</p>
            <p className="mt-2 text-2xl font-bold text-sphere-primary-800">{members.length}</p>
          </div>
          <div className="rounded-lg border border-sphere-grey-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-sphere-grey-500">Sub-organizations</p>
            <p className="mt-2 text-2xl font-bold text-sphere-primary-800">{org?.subOrganizations?.length ?? 0}</p>
          </div>
          <div className="rounded-lg border border-sphere-grey-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-sphere-grey-500">Invitations</p>
            <p className="mt-2 text-2xl font-bold text-sphere-primary-800">{invitations.length}</p>
          </div>
          <div className="rounded-lg border border-sphere-grey-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-sphere-grey-500">Created</p>
            <p className="mt-2 text-sm font-semibold text-sphere-grey-800">
              {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="rounded-xl border border-sphere-grey-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-sphere-grey-800">Members</h2>
              <p className="text-sm text-sphere-grey-500">Manage who has access to this organization.</p>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => setAddMemberModalOpen(true)}
                className="flex items-center gap-2 rounded-md bg-sphere-primary-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sphere-primary-700"
              >
                <Iconify icon="mdi:account-plus-outline" width={16} />
                Add member
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {members.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-sphere-grey-400">
                <Iconify icon="mdi:account-group-outline" width={36} />
                <p className="text-sm">No members yet.</p>
              </div>
            )}

            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-sphere-grey-200 bg-sphere-grey-50 px-4 py-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sphere-grey-600">
                  <Iconify icon="mdi:account-outline" width={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-sphere-grey-800">
                    @{member.user.username}
                  </p>
                  <p className="text-xs text-sphere-grey-500">{member.user.email}</p>
                </div>

                {canManage && member.user.id !== authUser.user?.id ? (
                  <select
                    value={member.role}
                    onChange={(event) =>
                      handleRoleChange(member, event.target.value as OrgRole)
                    }
                    className="rounded border border-sphere-grey-300 bg-white px-2 py-1 text-xs font-semibold text-sphere-grey-700"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                    <option value="OWNER">Owner</option>
                  </select>
                ) : (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${ROLE_STYLES[member.role]}`}
                  >
                    {ROLE_LABELS[member.role]}
                  </span>
                )}

                {canManage && member.user.id !== authUser.user?.id && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member)}
                    title="Remove member"
                    className="text-sphere-grey-300 hover:text-red-500"
                  >
                    <Iconify icon="mdi:account-remove-outline" width={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'invitations' && (
        <div className="rounded-xl border border-sphere-grey-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-sphere-grey-800">Invitations</h2>
              <p className="text-sm text-sphere-grey-500">Manage invitation links for this organization.</p>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => setInviteModalOpen(true)}
                className="flex items-center gap-2 rounded-md bg-sphere-primary-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sphere-primary-700"
              >
                <Iconify icon="mdi:link-plus" width={16} />
                Generate invite
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {invitations.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-sphere-grey-400">
                <Iconify icon="mdi:link-variant-off" width={36} />
                <p className="text-sm">No invitations yet.</p>
              </div>
            )}

            {invitations.map((inv) => {
              const isActive = !inv.expiresAt || new Date(inv.expiresAt) > new Date();
              return (
                <div
                  key={inv.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-sphere-grey-200 bg-sphere-grey-50 px-4 py-3"
                >
                  <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm text-sphere-grey-700">
                    {inv.code}
                  </code>
                  <span className="text-xs text-sphere-grey-500">
                    {inv.useCount} use{inv.useCount !== 1 ? 's' : ''}
                    {inv.maxUses ? ` / ${inv.maxUses}` : ''}
                  </span>
                  <span className={`text-xs ${isActive ? 'text-green-600' : 'text-red-500'}`}>
                    {isActive ? 'Active' : 'Expired'}
                  </span>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => {
                        customConfirm('Revoke this invitation?')
                          .then(() =>
                            revokeInvitation(org.id, inv.id)
                              .then(() => refreshInvitations())
                              .catch((err: Error) => customAlert(err.message))
                          )
                          .catch(() => {});
                      }}
                      className="text-sphere-grey-300 hover:text-red-500"
                    >
                      <Iconify icon="mdi:trash-can-outline" width={18} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'children' && (
        <div className="rounded-xl border border-sphere-grey-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-sphere-grey-800">Sub-organizations</h2>
              <p className="text-sm text-sphere-grey-500">
                Child organizations within this organization hierarchy.
              </p>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => setCreateSubOrgModalOpen(true)}
                className="flex items-center gap-2 rounded-md bg-sphere-primary-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sphere-primary-700"
              >
                <Iconify icon="mdi:plus" width={16} />
                Create sub-organization
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {(!org?.subOrganizations || org.subOrganizations.length === 0) && (
              <div className="flex flex-col items-center gap-2 py-10 text-sphere-grey-400">
                <Iconify icon="mdi:folder-multiple-outline" width={36} />
                <p className="text-sm">No sub-organizations yet.</p>
              </div>
            )}

            {org?.subOrganizations?.map((child) => {
              const hasAccess = childAccessMap[child.id] ?? false;
              return (
                <div
                  key={child.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-sphere-grey-200 bg-sphere-grey-50 px-4 py-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sphere-grey-600">
                    <Iconify icon="mdi:domain" width={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-sphere-grey-800">
                      {child.displayName}
                    </p>
                    <p className="text-xs text-sphere-grey-500">@{child.name}</p>
                  </div>

                  {!hasAccess && (
                    <span title="You don't have access to this sub-organization" className="text-sphere-grey-400">
                      <Iconify icon="mdi:lock-outline" width={16} />
                    </span>
                  )}

                  {hasAccess && (
                    <button
                      type="button"
                      onClick={() => router.push(`/orgs/${child.id}`)}
                      className="flex items-center gap-1 rounded-md border border-sphere-grey-300 px-3 py-1.5 text-xs font-semibold text-sphere-grey-700 hover:bg-sphere-grey-100"
                    >
                      Open
                      <Iconify icon="mdi:chevron-right" width={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editModalOpen && org && (
        <EditOrgModal
          org={org}
          onClose={() => setEditModalOpen(false)}
          onSaved={(updated) => {
            setOrg(updated);
            setEditModalOpen(false);
          }}
        />
      )}

      {addMemberModalOpen && org && (
        <AddMemberModal
          orgId={org.id}
          onClose={() => setAddMemberModalOpen(false)}
          onAdded={refreshMembers}
        />
      )}

      {inviteModalOpen && org && (
        <InviteModal
          orgId={org.id}
          invitations={invitations}
          onClose={() => setInviteModalOpen(false)}
          onRefresh={refreshInvitations}
        />
      )}

      {createSubOrgModalOpen && org && (
        <CreateSubOrgModal
          parentId={org.id}
          onClose={() => setCreateSubOrgModalOpen(false)}
          onCreated={loadOrgData}
        />
      )}
    </div>
  );
}
