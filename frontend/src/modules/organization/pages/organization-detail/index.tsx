import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Iconify from '../../../core/components/iconify';
import { useRouter } from '../../../core/hooks/useRouter';
import { useAuth } from '../../../auth/hooks/useAuth';
import customAlert from '../../../core/utils/custom-alert';
import customConfirm from '../../../core/utils/custom-confirm';
import {
  staggerContainer,
  fadeInUp,
  transitionDefault,
  transitionFast,
  cardHover,
} from '../../../core/utils/motion-variants';
import {
  Organization,
  OrgMemberWithUser,
  OrganizationInvitation,
  OrgRole,
  OrgPricing,
  OrgCollection,
  useOrganizationsApi,
} from '../../api/organizationsApi';
import PermissionsTab from '../../components/PermissionsTab';
import Pagination from '../../../pricing/components/pagination';

const ROLE_LABELS: Record<OrgRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
};

const ROLE_COLORS: Record<OrgRole, string> = {
  OWNER: 'bg-tp-primary/10 text-tp-primary',
  ADMIN: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  MEMBER: 'bg-tp-surface text-tp-steel',
};

type Tab = 'overview' | 'members' | 'invitations' | 'pricings' | 'collections' | 'children' | 'permissions';

const TAB_META: Record<Tab, { label: string; icon: string }> = {
  overview: { label: 'Overview', icon: 'mdi:view-dashboard-outline' },
  members: { label: 'Members', icon: 'mdi:account-group-outline' },
  invitations: { label: 'Invitations', icon: 'mdi:link-variant' },
  pricings: { label: 'Pricings', icon: 'mdi:tag-outline' },
  collections: { label: 'Collections', icon: 'mdi:folder-outline' },
  children: { label: 'Hierarchy', icon: 'mdi:graph-outline' },
  permissions: { label: 'Permissions', icon: 'mdi:shield-lock-outline' },
};

/* ═══════════════════════════════════════════════════════════════
   MODAL: Edit Organization
   ═══════════════════════════════════════════════════════════════ */
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
    updateOrganization(org.id, { displayName, description: description || null })
      .then((updated) => { onSaved(updated); onClose(); })
      .catch((err: Error) => { customAlert(err.message); setIsSaving(false); });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-tp-ink/30 p-4 backdrop-blur-sm sm:p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={transitionFast}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[28rem] rounded-xl border border-tp-hairline-soft bg-tp-canvas p-6 shadow-elevation-4"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-tp-ink">Edit Organization</h2>
          <button onClick={onClose} className="text-tp-steel transition-colors hover:text-tp-ink">
            <Iconify icon="mdi:close" width={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-tp-steel">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={255}
              className="rounded-lg border border-tp-hairline-strong bg-tp-canvas px-3 py-2.5 text-sm text-tp-ink outline-none transition-colors focus:border-tp-primary focus:ring-1 focus:ring-tp-primary/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-tp-steel">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              className="rounded-lg border border-tp-hairline-strong bg-tp-canvas px-3 py-2.5 text-sm text-tp-ink outline-none transition-colors focus:border-tp-primary focus:ring-1 focus:ring-tp-primary/20"
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg border border-tp-hairline-strong px-4 py-2 text-sm font-medium text-tp-slate transition-colors hover:bg-tp-surface">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="rounded-lg bg-tp-primary px-4 py-2 text-sm font-medium text-tp-on-primary transition-colors hover:bg-tp-primary-deep disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: Create Sub-Organization
   ═══════════════════════════════════════════════════════════════ */
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

  const slug = displayName
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    createOrganization({ name: slug, displayName: displayName.trim(), _parentId: parentId })
      .then(() => { onCreated(); onClose(); })
      .catch((err: Error) => { customAlert(err.message); setIsSaving(false); });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-tp-ink/30 p-4 backdrop-blur-sm sm:p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={transitionFast}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[28rem] rounded-xl border border-tp-hairline-soft bg-tp-canvas p-6 shadow-elevation-4"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-tp-ink">Create Sub-organization</h2>
          <button onClick={onClose} className="text-tp-steel transition-colors hover:text-tp-ink">
            <Iconify icon="mdi:close" width={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-tp-steel">Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="My Sub Organization"
              required
              maxLength={255}
              className="rounded-lg border border-tp-hairline-strong bg-tp-canvas px-3 py-2.5 text-sm text-tp-ink outline-none transition-colors focus:border-tp-primary focus:ring-1 focus:ring-tp-primary/20"
            />
            {displayName.trim() && (
              <p className="text-xs text-tp-ink">
                Identifier: <span className="font-mono text-tp-slate">{slug}</span>
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg border border-tp-hairline-strong px-4 py-2 text-sm font-medium text-tp-slate transition-colors hover:bg-tp-surface">
              Cancel
            </button>
            <button type="submit" disabled={isSaving || slug.length < 3} className="rounded-lg bg-tp-primary px-4 py-2 text-sm font-medium text-tp-on-primary transition-colors hover:bg-tp-primary-deep disabled:opacity-50">
              {isSaving ? 'Creating...' : 'Create sub-organization'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: Add Member
   ═══════════════════════════════════════════════════════════════ */
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-tp-ink/30 p-4 backdrop-blur-sm sm:p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={transitionFast}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[28rem] rounded-xl border border-tp-hairline-soft bg-tp-canvas p-6 shadow-elevation-4"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-tp-ink">Add Member</h2>
          <button onClick={onClose} className="text-tp-steel transition-colors hover:text-tp-ink">
            <Iconify icon="mdi:close" width={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-tp-steel">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="john-doe"
              required
              className="rounded-lg border border-tp-hairline-strong bg-tp-canvas px-3 py-2.5 text-sm text-tp-ink outline-none transition-colors focus:border-tp-primary focus:ring-1 focus:ring-tp-primary/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-tp-steel">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as OrgRole)}
              className="rounded-lg border border-tp-hairline-strong bg-tp-canvas px-3 py-2.5 text-sm text-tp-ink outline-none transition-colors focus:border-tp-primary focus:ring-1 focus:ring-tp-primary/20"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg border border-tp-hairline-strong px-4 py-2 text-sm font-medium text-tp-slate transition-colors hover:bg-tp-surface">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-tp-primary px-4 py-2 text-sm font-medium text-tp-on-primary transition-colors hover:bg-tp-primary-deep disabled:opacity-50">
              {isSubmitting ? 'Adding...' : 'Add member'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL: Invite Members
   ═══════════════════════════════════════════════════════════════ */
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
      .then(() => revokeInvitation(orgId, inv.id).then(() => onRefresh()).catch((err: Error) => customAlert(err.message)))
      .catch(() => {});
  };

  const handleCopy = (code: string) => {
    const joinUrl = `${window.location.origin}/orgs/join/${code}`;
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const activeInvitations = invitations.filter((inv) => !inv.expiresAt || new Date(inv.expiresAt) > new Date());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-tp-ink/30 p-4 backdrop-blur-sm sm:p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={transitionFast}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[32rem] rounded-xl border border-tp-hairline-soft bg-tp-canvas p-6 shadow-elevation-4"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-tp-ink">Invite Members</h2>
          <button onClick={onClose} className="text-tp-steel transition-colors hover:text-tp-ink">
            <Iconify icon="mdi:close" width={20} />
          </button>
        </div>
        <p className="mb-4 text-sm text-tp-steel">
          Share an invite link. Anyone with the link can join this organization as a member.
        </p>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg bg-tp-primary px-4 py-2.5 text-sm font-medium text-tp-on-primary transition-colors hover:bg-tp-primary-deep disabled:opacity-50"
        >
          <Iconify icon="mdi:link-plus" width={18} />
          {isGenerating ? 'Generating...' : 'Generate new invite link'}
        </button>

        {activeInvitations.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-tp-ink">Active invitations</p>
            {activeInvitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-2 rounded-lg border border-tp-hairline-soft bg-tp-surface px-3 py-2.5"
              >
                <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-tp-slate">
                  {inv.code}
                </code>
                <span className="whitespace-nowrap text-[11px] text-tp-ink">
                  {inv.useCount} use{inv.useCount !== 1 ? 's' : ''}
                  {inv.expiresAt && <> · exp {new Date(inv.expiresAt).toLocaleDateString()}</>}
                </span>
                <button onClick={() => handleCopy(inv.code)} title="Copy invite link" className="text-tp-ink transition-colors hover:text-tp-primary">
                  <Iconify icon={copiedCode === inv.code ? 'mdi:check' : 'mdi:content-copy'} width={14} />
                </button>
                <button onClick={() => handleRevoke(inv)} title="Revoke invitation" className="text-tp-ink transition-colors hover:text-red-500">
                  <Iconify icon="mdi:trash-can-outline" width={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeInvitations.length === 0 && (
          <p className="text-center text-sm text-tp-ink">No active invitations.</p>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ORG HIERARCHY TREE
   ═══════════════════════════════════════════════════════════════ */
interface TreeNode {
  id: string;
  displayName: string;
  name: string;
  avatar: string | null;
  isPersonal: boolean;
  _parentId: string | null;
  children: TreeNode[];
  hasAccess: boolean;
  isAncestor?: boolean;
  isCurrent?: boolean;
}

function OrgTreeNode({
  node,
  level = 0,
  expandedIds,
  onToggle,
  onNavigate,
}: {
  node: TreeNode;
  level?: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onNavigate: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);

  return (
    <div>
      <div
        className={`group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
          node.isCurrent
            ? 'bg-tp-primary/8 ring-1 ring-tp-primary/20'
            : node.hasAccess
              ? 'hover:bg-tp-surface cursor-pointer'
              : 'opacity-60'
        }`}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
        onClick={() => {
          if (node.hasAccess && !node.isCurrent) {
            onNavigate(node.id);
          }
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-tp-steel transition-colors hover:bg-tp-hairline-soft"
          >
            <Iconify icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'} width={14} />
          </button>
        ) : (
          <span className="h-5 w-5 shrink-0" />
        )}

        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-tp-cream text-[11px] font-bold text-tp-primary">
          {node.avatar ? (
            <img
              src={node.avatar}
              alt=""
              className="h-7 w-7 rounded-md object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <span className={node.avatar ? 'hidden' : ''}>
            {node.name[0]?.toUpperCase() ?? 'O'}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm ${node.isCurrent ? 'font-semibold text-tp-ink' : 'font-medium text-tp-ink'}`}>
            {node.displayName}
            {node.isCurrent && <span className="ml-2 text-[11px] text-tp-primary">(current)</span>}
          </p>
        </div>

        {!node.hasAccess && (
          <Iconify icon="mdi:lock-outline" width={14} className="shrink-0 text-tp-ink" />
        )}

        {node.isAncestor && (
          <span className="shrink-0 rounded bg-tp-surface px-1.5 py-0.5 text-[10px] font-medium text-tp-steel">ancestor</span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <OrgTreeNode
                key={child.id}
                node={child}
                level={level + 1}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onNavigate={onNavigate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function OrganizationDetailPage() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { authUser } = useAuth();
  const router = useRouter();

  const [org, setOrg] = useState<Organization | null>(null);
  const [myRole, setMyRole] = useState<OrgRole | null>(null);
  const [members, setMembers] = useState<OrgMemberWithUser[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [pricings, setPricings] = useState<OrgPricing[]>([]);
  const [pricingsTotal, setPricingsTotal] = useState(0);
  const [pricingPage, setPricingPage] = useState(1);
  const [pricingSearch, setPricingSearch] = useState('');
  const [collections, setCollections] = useState<OrgCollection[]>([]);
  const [collectionsTotal, setCollectionsTotal] = useState(0);
  const [collectionPage, setCollectionPage] = useState(1);
  const [collectionSearch, setCollectionSearch] = useState('');
  const [childAccessMap, setChildAccessMap] = useState<Record<string, boolean>>({});
  const [hierarchyTree, setHierarchyTree] = useState<TreeNode | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createSubOrgModalOpen, setCreateSubOrgModalOpen] = useState(false);
  const [expandedTreeIds, setExpandedTreeIds] = useState<Set<string>>(new Set());

  const {
    getOrganization,
    getOrgMembers,
    listInvitations,
    getOrgPricings,
    getOrgCollections,
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
      if (userRole) setMyRole(userRole);

      const invitationsData = (userRole === 'OWNER' || userRole === 'ADMIN')
        ? await listInvitations(organizationId)
        : [];
      setInvitations(invitationsData);

      const pricingsData = await getOrgPricings(organizationId).catch(() => ({ pricings: [], total: 0 }));
      setPricings(pricingsData.pricings);
      setPricingsTotal(pricingsData.total);

      const collectionsData = await getOrgCollections(organizationId).catch(() => ({ collections: [], total: 0 }));
      setCollections(collectionsData.collections);
      setCollectionsTotal(collectionsData.total);

      const children = orgData.subOrganizations ?? [];
      if (userRole === 'OWNER' || userRole === 'ADMIN') {
        const map: Record<string, boolean> = {};
        for (const child of children) map[child.id] = true;
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

  /* ─── Build hierarchy tree (ancestors + descendants in one pass) ─── */
  const buildHierarchyTree = useCallback(async () => {
    if (!org) return;

    const buildDescendants = async (nodeOrg: Organization, accessRole: OrgRole | null): Promise<TreeNode[]> => {
      const children = nodeOrg.subOrganizations ?? [];
      const results: TreeNode[] = [];

      for (const child of children) {
        let hasAccess = false;
        if (accessRole === 'OWNER' || accessRole === 'ADMIN') {
          hasAccess = true;
        } else {
          hasAccess = childAccessMap[child.id] ?? false;
        }

        let childOrgData: Organization | null = null;
        if (hasAccess) {
          try {
            childOrgData = await getOrganization(child.id);
          } catch {
            childOrgData = child;
          }
        }

        const grandchildren = hasAccess && childOrgData
          ? await buildDescendants(childOrgData, accessRole)
          : [];

        results.push({
          id: child.id,
          displayName: child.displayName,
          name: child.name,
          avatar: child.avatar,
          isPersonal: child.isPersonal,
          _parentId: child._parentId,
          children: grandchildren,
          hasAccess,
        });
      }

      return results;
    };

    const childNodes = await buildDescendants(org, myRole);

    let currentNode: TreeNode = {
      id: org.id,
      displayName: org.displayName,
      name: org.name,
      avatar: org.avatar,
      isPersonal: org.isPersonal,
      _parentId: org._parentId,
      children: childNodes,
      hasAccess: true,
      isCurrent: true,
    };

    if (org._parentId) {
      let currentParentId: string | null = org._parentId;
      while (currentParentId) {
        try {
          const ancestorOrg = await getOrganization(currentParentId);
          const ancestorNode: TreeNode = {
            id: ancestorOrg.id,
            displayName: ancestorOrg.displayName,
            name: ancestorOrg.name,
            avatar: ancestorOrg.avatar,
            isPersonal: ancestorOrg.isPersonal,
            _parentId: ancestorOrg._parentId,
            children: [currentNode],
            hasAccess: true,
            isAncestor: true,
          };
          currentNode = ancestorNode;
          currentParentId = ancestorOrg._parentId;
        } catch {
          break;
        }
      }
    }

    setHierarchyTree(currentNode);
  }, [org, myRole, childAccessMap, getOrganization]);

  useEffect(() => {
    if (org && myRole) {
      buildHierarchyTree();
    }
  }, [org, myRole, childAccessMap]);

  useEffect(() => {
    if (hierarchyTree) {
      setExpandedTreeIds((prev) => {
        const next = new Set(prev);
        next.add(hierarchyTree.id);
        return next;
      });
    }
  }, [hierarchyTree?.id]);

  const refreshMembers = useCallback(async () => {
    if (!org) return;
    try {
      const data = await getOrgMembers(org.id);
      setMembers(data);
    } catch { /* silently ignore */ }
  }, [org, getOrgMembers]);

  const refreshInvitations = useCallback(async () => {
    if (!org) return;
    try {
      const data = await listInvitations(org.id);
      setInvitations(data);
    } catch { /* silently ignore */ }
  }, [org, listInvitations]);

  const PER_PAGE = 10;

  const fetchPricings = useCallback(async (page: number, search: string) => {
    if (!org) return;
    try {
      const filters: Record<string, string> = {
        limit: String(PER_PAGE),
        offset: String((page - 1) * PER_PAGE),
      };
      if (search) filters.name = search;
      const data = await getOrgPricings(org.id, filters);
      setPricings(data.pricings);
      setPricingsTotal(data.total);
    } catch { /* silently ignore */ }
  }, [org, getOrgPricings]);

  const fetchCollections = useCallback(async (page: number, search: string) => {
    if (!org) return;
    try {
      const filters: Record<string, string> = {
        limit: String(PER_PAGE),
        offset: String((page - 1) * PER_PAGE),
      };
      if (search) filters.name = search;
      const data = await getOrgCollections(org.id, filters);
      setCollections(data.collections);
      setCollectionsTotal(data.total);
    } catch { /* silently ignore */ }
  }, [org, getOrgCollections]);

  useEffect(() => {
    if (authUser.isLoading) return;
    if (!authUser.isAuthenticated) { router.push('/login'); return; }
    if (!organizationId) return;
    loadOrgData();
  }, [authUser.isLoading, authUser.isAuthenticated, organizationId]);

  useEffect(() => {
    if (activeTab === 'pricings' && org) {
      fetchPricings(pricingPage, pricingSearch);
    }
  }, [activeTab, org, pricingPage, pricingSearch]);

  useEffect(() => {
    if (activeTab === 'collections' && org) {
      fetchCollections(collectionPage, collectionSearch);
    }
  }, [activeTab, org, collectionPage, collectionSearch]);

  const handleRemoveMember = (member: OrgMemberWithUser) => {
    customConfirm(`Remove @${member.user.username} from this organization?`)
      .then(() => removeMember(org!.id, member.user.id).then(() => refreshMembers()).catch((err: Error) => customAlert(err.message)))
      .catch(() => {});
  };

  const handleRoleChange = async (member: OrgMemberWithUser, newRole: OrgRole) => {
    updateMemberRole(org!.id, member.user.id, newRole).then(() => refreshMembers()).catch((err: Error) => customAlert(err.message));
  };

  const availableTabs = useMemo(() => {
    const tabs: Tab[] = ['overview', 'members', 'invitations', 'pricings', 'collections', 'children'];
    if (canManage) tabs.push('permissions');
    return tabs;
  }, [canManage]);

  const handleTreeToggle = useCallback((id: string) => {
    setExpandedTreeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (hierarchyTree) {
      setExpandedTreeIds((prev) => {
        const next = new Set(prev);
        next.add(hierarchyTree.id);
        return next;
      });
    }
  }, [hierarchyTree?.id]);

  /* ─── Loading state ─── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-tp-hairline border-b-tp-primary" />
          <span className="text-sm text-tp-steel">Loading organization...</span>
        </div>
      </div>
    );
  }

  /* ─── Error state ─── */
  if (error || !org) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error ?? 'Organization not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ═══ HERO HEADER ═══ */}
      <div className="relative overflow-hidden border-b border-tp-hairline-soft bg-gradient-to-br from-tp-cream via-tp-cream-light to-tp-canvas">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(250,82,15,0.06)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Back navigation */}
            <motion.button
              variants={fadeInUp}
              transition={transitionDefault}
              type="button"
              onClick={() => router.push('/me/orgs')}
              className="mb-5 inline-flex items-center gap-1.5 text-sm text-tp-steel transition-colors hover:text-tp-ink"
            >
              <Iconify icon="mdi:arrow-left" width={16} />
              Organizations
            </motion.button>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {/* Avatar */}
              <motion.div variants={fadeInUp} transition={transitionDefault} className="shrink-0">
                {org.avatar ? (
                  <>
                    <img
                      src={org.avatar}
                      alt={org.displayName}
                      className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white shadow-elevation-2 sm:h-20 sm:w-20"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-tp-primary/10 ring-2 ring-white shadow-elevation-2 sm:h-20 sm:w-20">
                      <Iconify icon="mdi:domain" width={32} className="text-tp-primary" />
                    </div>
                  </>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tp-primary/10 ring-2 ring-white shadow-elevation-2 sm:h-20 sm:w-20">
                    <Iconify icon="mdi:domain" width={32} className="text-tp-primary" />
                  </div>
                )}
              </motion.div>

              {/* Info + Edit */}
              <div className="min-w-0 flex-1">
                <motion.div variants={fadeInUp} transition={transitionDefault} className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-2xl text-tp-ink sm:text-3xl">{org.displayName}</h1>
                  {myRole && (
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ROLE_COLORS[myRole]}`}>
                      {ROLE_LABELS[myRole]}
                    </span>
                  )}
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setEditModalOpen(true)}
                      className="ml-auto flex items-center gap-1.5 rounded-lg border border-tp-hairline-strong bg-tp-canvas px-3 py-2 text-sm font-medium text-tp-slate transition-colors hover:border-tp-hairline hover:bg-tp-surface hover:text-tp-ink sm:ml-0"
                    >
                      <Iconify icon="mdi:pencil-outline" width={15} />
                      Edit
                    </button>
                  )}
                </motion.div>
                <motion.p variants={fadeInUp} transition={transitionDefault} className="mt-0.5 font-mono text-sm text-tp-steel">
                  @{org.name}
                </motion.p>
                {org.description && (
                  <motion.p variants={fadeInUp} transition={transitionDefault} className="mt-2 max-w-2xl text-sm leading-relaxed text-tp-slate">
                    {org.description}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <motion.div variants={fadeInUp} transition={transitionDefault} className="mt-6 flex flex-wrap gap-x-5 gap-y-2 sm:gap-x-6">
              {[
                { label: 'Members', value: members.length, icon: 'mdi:account-group-outline' },
                { label: 'Sub-orgs', value: org.subOrganizations?.length ?? 0, icon: 'mdi:graph-outline' },
                { label: 'Pricings', value: pricings.length, icon: 'mdi:tag-outline' },
                { label: 'Collections', value: collections.length, icon: 'mdi:folder-outline' },
                { label: 'Invitations', value: invitations.length, icon: 'mdi:link-variant' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-1.5">
                  <Iconify icon={stat.icon} width={14} className="text-tp-steel" />
                  <span className="text-sm font-semibold text-tp-ink">{stat.value}</span>
                  <span className="text-xs text-tp-steel">{stat.label}</span>
                </div>
              ))}
              {org.createdAt && (
                <div className="flex items-center gap-2">
                  <Iconify icon="mdi:calendar-outline" width={15} className="text-tp-ink" />
                  <span className="text-xs text-tp-steel">
                    Created {new Date(org.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ═══ TAB NAVIGATION ═══ */}
      <div className="sticky top-14 z-30 border-b border-tp-hairline-soft bg-tp-canvas/80 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          {/* Mobile: dropdown selector */}
          <div className="py-2 md:hidden">
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as Tab)}
                className="w-full appearance-none rounded-lg border border-tp-hairline-strong bg-tp-canvas px-3 py-2.5 pr-8 text-sm font-medium text-tp-ink transition-colors focus:border-tp-primary focus:outline-none"
              >
                {availableTabs.map((tab) => (
                  <option key={tab} value={tab}>
                    {TAB_META[tab].label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tp-steel"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Desktop: horizontal tabs */}
          <nav className="hidden gap-1 overflow-x-auto py-1 md:flex" role="tablist">
            {availableTabs.map((tab) => {
              const meta = TAB_META[tab];
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === tab
                      ? 'bg-tp-primary/8 text-tp-primary'
                      : 'text-tp-steel hover:bg-tp-surface hover:text-tp-ink'
                  }`}
                >
                  <Iconify icon={meta.icon} width={16} />
                  {meta.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ═══ TAB CONTENT ═══ */}
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
        <AnimatePresence mode="wait">
          {/* ─── OVERVIEW ─── */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={transitionDefault}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Members', value: members.length, icon: 'mdi:account-group-outline', color: 'bg-tp-primary/8 text-tp-primary' },
                  { label: 'Sub-organizations', value: org.subOrganizations?.length ?? 0, icon: 'mdi:graph-outline', color: 'bg-emerald-50 text-emerald-600' },
                  { label: 'Pricings', value: pricings.length, icon: 'mdi:tag-outline', color: 'bg-blue-50 text-blue-600' },
                  { label: 'Collections', value: collections.length, icon: 'mdi:folder-outline', color: 'bg-purple-50 text-purple-600' },
                  { label: 'Invitations', value: invitations.length, icon: 'mdi:link-variant', color: 'bg-amber-50 text-amber-600' },
                  { label: 'Created', value: org.createdAt ? new Date(org.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A', icon: 'mdi:calendar-outline', color: 'bg-tp-surface text-tp-steel', isText: true },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={cardHover}
                    initial="rest"
                    whileHover="hover"
                    className="rounded-xl border border-tp-hairline-soft bg-tp-canvas p-4 transition-shadow hover:shadow-elevation-1"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                        <Iconify icon={stat.icon} width={18} />
                      </div>
                      <div>
                        {stat.isText ? (
                          <p className="text-sm font-medium text-tp-ink">{stat.value}</p>
                        ) : (
                          <p className="text-2xl font-semibold text-tp-ink">{stat.value}</p>
                        )}
                        <p className="text-[11px] text-tp-steel">{stat.label}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── MEMBERS ─── */}
          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={transitionDefault}
            >
              <div className="rounded-xl border border-tp-hairline-soft bg-tp-canvas">
                <div className="flex flex-col gap-3 border-b border-tp-hairline-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-lg text-tp-ink">Members</h2>
                    <p className="text-xs text-tp-steel">Manage who has access to this organization.</p>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setAddMemberModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-tp-primary px-3 py-2 text-sm font-medium text-tp-on-primary transition-colors hover:bg-tp-primary-deep"
                    >
                      <Iconify icon="mdi:account-plus-outline" width={16} />
                      Add member
                    </button>
                  )}
                </div>

                <div className="divide-y divide-tp-hairline-soft">
                  {members.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-12 text-tp-ink">
                      <Iconify icon="mdi:account-group-outline" width={32} />
                      <p className="text-sm">No members yet.</p>
                    </div>
                  )}

                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-tp-surface/50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tp-cream text-sm font-semibold text-tp-primary">
                        {member.user.username[0]?.toUpperCase() ?? 'U'}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-tp-ink">@{member.user.username}</p>
                        <p className="text-[11px] text-tp-steel">{member.user.email}</p>
                      </div>

                      {canManage && member.user.id !== authUser.user?.id ? (
                        <select
                          value={member.role}
                          onChange={(event) => handleRoleChange(member, event.target.value as OrgRole)}
                          className="rounded-lg border border-tp-hairline-strong bg-tp-canvas px-2.5 py-1.5 text-xs font-medium text-tp-slate outline-none transition-colors focus:border-tp-primary"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="ADMIN">Admin</option>
                          <option value="OWNER">Owner</option>
                        </select>
                      ) : (
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ROLE_COLORS[member.role]}`}>
                          {ROLE_LABELS[member.role]}
                        </span>
                      )}

                      {canManage && member.user.id !== authUser.user?.id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member)}
                          title="Remove member"
                          className="text-tp-hairline-strong transition-colors hover:text-red-500"
                        >
                          <Iconify icon="mdi:account-remove-outline" width={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── INVITATIONS ─── */}
          {activeTab === 'invitations' && (
            <motion.div
              key="invitations"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={transitionDefault}
            >
              <div className="rounded-xl border border-tp-hairline-soft bg-tp-canvas">
                <div className="flex flex-col gap-3 border-b border-tp-hairline-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-lg text-tp-ink">Invitations</h2>
                    <p className="text-xs text-tp-steel">Manage invitation links for this organization.</p>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setInviteModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-tp-primary px-3 py-2 text-sm font-medium text-tp-on-primary transition-colors hover:bg-tp-primary-deep"
                    >
                      <Iconify icon="mdi:link-plus" width={16} />
                      Generate invite
                    </button>
                  )}
                </div>

                <div className="divide-y divide-tp-hairline-soft">
                  {invitations.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-12 text-tp-ink">
                      <Iconify icon="mdi:link-variant-off" width={32} />
                      <p className="text-sm">No invitations yet.</p>
                    </div>
                  )}

                  {invitations.map((inv) => {
                    const isActive = !inv.expiresAt || new Date(inv.expiresAt) > new Date();
                    return (
                      <div
                        key={inv.id}
                        className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-tp-surface/50"
                      >
                        <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-tp-slate">
                          {inv.code}
                        </code>
                        <span className="whitespace-nowrap text-[11px] text-tp-ink">
                          {inv.useCount} use{inv.useCount !== 1 ? 's' : ''}
                          {inv.maxUses ? ` / ${inv.maxUses}` : ''}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                          {isActive ? 'Active' : 'Expired'}
                        </span>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => {
                              customConfirm('Revoke this invitation?')
                                .then(() => revokeInvitation(org.id, inv.id).then(() => refreshInvitations()).catch((err: Error) => customAlert(err.message)))
                                .catch(() => {});
                            }}
                            className="text-tp-hairline-strong transition-colors hover:text-red-500"
                          >
                            <Iconify icon="mdi:trash-can-outline" width={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── PRICINGS ─── */}
          {activeTab === 'pricings' && (
            <motion.div
              key="pricings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={transitionDefault}
            >
              <div className="rounded-xl border border-tp-hairline-soft bg-tp-canvas">
                <div className="flex flex-col gap-3 border-b border-tp-hairline-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-lg text-tp-ink">Pricings</h2>
                    <p className="text-xs text-tp-steel">Pricings owned by this organization.</p>
                  </div>
                  <div className="w-full sm:w-64">
                    <input
                      type="text"
                      value={pricingSearch}
                      onChange={(e) => { setPricingSearch(e.target.value); setPricingPage(1); }}
                      placeholder="Search pricings..."
                      className="h-9 w-full rounded-lg border border-tp-hairline-strong bg-tp-canvas px-3 text-sm text-tp-ink placeholder-tp-muted transition-colors focus:border-tp-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="divide-y divide-tp-hairline-soft">
                  {pricings.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-12 text-tp-ink">
                      <Iconify icon="mdi:tag-off-outline" width={32} />
                      <p className="text-sm">No pricings found.</p>
                    </div>
                  )}

                  {pricings.map((pricing) => (
                    <button
                      key={`${pricing.name}-${pricing.version}`}
                      type="button"
                      onClick={() => router.push(`/pricings/${org.id}/${pricing.name}`)}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-tp-surface/50 sm:gap-4 cursor-pointer"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Iconify icon="mdi:tag-outline" width={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-tp-ink">{pricing.name}</p>
                        <p className="text-[11px] text-tp-steel">
                          v{pricing.version} · {pricing.currency}
                        </p>
                      </div>
                      <span className="hidden text-[11px] text-tp-ink sm:inline">
                        {new Date(pricing.createdAt).toLocaleDateString()}
                      </span>
                      <Iconify icon="mdi:chevron-right" width={16} className="text-tp-hairline-strong" />
                    </button>
                  ))}
                </div>

                {pricingsTotal > PER_PAGE && (
                  <div className="border-t border-tp-hairline-soft px-5 py-3">
                    <Pagination
                      currentPage={pricingPage}
                      totalPages={Math.ceil(pricingsTotal / PER_PAGE)}
                      onPageChange={setPricingPage}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── COLLECTIONS ─── */}
          {activeTab === 'collections' && (
            <motion.div
              key="collections"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={transitionDefault}
            >
              <div className="rounded-xl border border-tp-hairline-soft bg-tp-canvas">
                <div className="flex flex-col gap-3 border-b border-tp-hairline-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-lg text-tp-ink">Collections</h2>
                    <p className="text-xs text-tp-steel">Collections owned by this organization.</p>
                  </div>
                  <div className="w-full sm:w-64">
                    <input
                      type="text"
                      value={collectionSearch}
                      onChange={(e) => { setCollectionSearch(e.target.value); setCollectionPage(1); }}
                      placeholder="Search collections..."
                      className="h-9 w-full rounded-lg border border-tp-hairline-strong bg-tp-canvas px-3 text-sm text-tp-ink placeholder-tp-muted transition-colors focus:border-tp-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="divide-y divide-tp-hairline-soft">
                  {collections.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-12 text-tp-ink">
                      <Iconify icon="mdi:folder-off-outline" width={32} />
                      <p className="text-sm">No collections found.</p>
                    </div>
                  )}

                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      type="button"
                      onClick={() => router.push(`/pricings/collections/${org.id}/${collection.name}`)}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-tp-surface/50 sm:gap-4 cursor-pointer"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                        <Iconify icon="mdi:folder-outline" width={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-tp-ink">{collection.name}</p>
                        <p className="text-[11px] text-tp-steel">
                          {collection.numberOfPricings} {collection.numberOfPricings === 1 ? 'pricing' : 'pricings'}
                        </p>
                      </div>
                      <Iconify icon="mdi:chevron-right" width={16} className="text-tp-hairline-strong" />
                    </button>
                  ))}
                </div>

                {collectionsTotal > PER_PAGE && (
                  <div className="border-t border-tp-hairline-soft px-5 py-3">
                    <Pagination
                      currentPage={collectionPage}
                      totalPages={Math.ceil(collectionsTotal / PER_PAGE)}
                      onPageChange={setCollectionPage}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── SUB-ORGANIZATIONS / HIERARCHY ─── */}
          {activeTab === 'children' && (
            <motion.div
              key="children"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={transitionDefault}
            >
              <div className="rounded-xl border border-tp-hairline-soft bg-tp-canvas">
                <div className="flex flex-col gap-3 border-b border-tp-hairline-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-lg text-tp-ink">Organization Hierarchy</h2>
                    <p className="text-xs text-tp-steel">
                      {org._parentId
                        ? 'Ancestors above, descendants below. Only accessible nodes are shown.'
                        : 'This is a root organization. All descendants are shown below.'}
                    </p>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setCreateSubOrgModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-tp-primary px-3 py-2 text-sm font-medium text-tp-on-primary transition-colors hover:bg-tp-primary-deep"
                    >
                      <Iconify icon="mdi:plus" width={16} />
                      Add child
                    </button>
                  )}
                </div>

                <div className="p-3">
                  {(!org.subOrganizations || org.subOrganizations.length === 0) && !org._parentId ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-tp-ink">
                      <Iconify icon="mdi:graph-outline" width={32} />
                      <p className="text-sm">No sub-organizations yet.</p>
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => setCreateSubOrgModalOpen(true)}
                          className="mt-1 text-sm font-medium text-tp-primary hover:underline"
                        >
                          Create the first sub-organization
                        </button>
                      )}
                    </div>
                  ) : hierarchyTree ? (
                    <OrgTreeNode
                      node={hierarchyTree}
                      expandedIds={expandedTreeIds}
                      onToggle={handleTreeToggle}
                      onNavigate={(id) => router.push(`/orgs/${id}`)}
                    />
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-tp-hairline border-b-tp-primary" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── PERMISSIONS ─── */}
          {activeTab === 'permissions' && organizationId && (
            <motion.div
              key="permissions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={transitionDefault}
            >
              <PermissionsTab organizationId={organizationId} canManage={canManage} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ MODALS ═══ */}
      <AnimatePresence>
        {editModalOpen && org && (
          <EditOrgModal org={org} onClose={() => setEditModalOpen(false)} onSaved={(updated) => { setOrg(updated); setEditModalOpen(false); }} />
        )}
        {addMemberModalOpen && org && (
          <AddMemberModal orgId={org.id} onClose={() => setAddMemberModalOpen(false)} onAdded={refreshMembers} />
        )}
        {inviteModalOpen && org && (
          <InviteModal orgId={org.id} invitations={invitations} onClose={() => setInviteModalOpen(false)} onRefresh={refreshInvitations} />
        )}
        {createSubOrgModalOpen && org && (
          <CreateSubOrgModal parentId={org.id} onClose={() => setCreateSubOrgModalOpen(false)} onCreated={loadOrgData} />
        )}
      </AnimatePresence>
    </div>
  );
}
