import { motion } from 'framer-motion';
import Iconify from '../../../../core/components/iconify';
import { transitionDefault } from '../../../../core/utils/motion-variants';
import customAlert from '../../../../core/utils/custom-alert';
import customConfirm from '../../../../core/utils/custom-confirm';
import { OrgMemberWithUser, OrgRole, useOrganizationsApi } from '../../../api/organizationsApi';
import { ROLE_LABELS, ROLE_COLORS } from '../constants';

interface Props {
  orgId: string;
  members: OrgMemberWithUser[];
  canManage: boolean;
  currentUserId: string | undefined;
  onRefresh: () => void;
  onAddMember: () => void;
}

export default function MembersTab({ orgId, members, canManage, currentUserId, onRefresh, onAddMember }: Props) {
  const { updateMemberRole, removeMember } = useOrganizationsApi();

  const handleRemoveMember = (member: OrgMemberWithUser) => {
    customConfirm(`Remove @${member.user.username} from this organization?`)
      .then(() => removeMember(orgId, member.user.id).then(() => onRefresh()).catch((err: Error) => customAlert(err.message)))
      .catch(() => {});
  };

  const handleRoleChange = async (member: OrgMemberWithUser, newRole: OrgRole) => {
    updateMemberRole(orgId, member.user.id, newRole).then(() => onRefresh()).catch((err: Error) => customAlert(err.message));
  };

  return (
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
              onClick={onAddMember}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-tp-primary px-3 py-2 text-sm font-medium text-tp-on-primary transition-colors hover:bg-tp-primary-deep"
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

              {canManage && member.user.id !== currentUserId ? (
                <select
                  value={member.role}
                  onChange={(event) => handleRoleChange(member, event.target.value as OrgRole)}
                  className="rounded-lg border border-tp-input-border bg-tp-input-bg px-2.5 py-1.5 text-xs font-medium text-tp-slate outline-none transition-colors focus:border-tp-primary"
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

              {canManage && member.user.id !== currentUserId && (
                <button
                  type="button"
                  onClick={() => handleRemoveMember(member)}
                  title="Remove member"
                  className="cursor-pointer text-tp-hairline-strong transition-colors hover:text-red-500"
                >
                  <Iconify icon="mdi:account-remove-outline" width={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
