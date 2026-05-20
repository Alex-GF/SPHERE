import { useState } from 'react';
import { motion } from 'framer-motion';
import Iconify from '../../../../core/components/iconify';
import { transitionFast } from '../../../../core/utils/motion-variants';
import customAlert from '../../../../core/utils/custom-alert';
import customConfirm from '../../../../core/utils/custom-confirm';
import { OrganizationInvitation, useOrganizationsApi } from '../../../api/organizationsApi';
import UserSearchInput, { UserSearchResult } from '../../../components/user-search-input';

interface Props {
  orgId: string;
  invitations: OrganizationInvitation[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function InviteModal({ orgId, invitations, onClose, onRefresh }: Props) {
  const [activeTab, setActiveTab] = useState<'link' | 'users'>('link');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const { createInvitation, revokeInvitation, inviteUsers } = useOrganizationsApi();

  const handleGenerate = () => {
    setIsGenerating(true);
    createInvitation(orgId)
      .then(() => onRefresh())
      .catch((err: Error) => customAlert(err.message, 'error'))
      .finally(() => setIsGenerating(false));
  };

  const handleRevoke = (inv: OrganizationInvitation) => {
    customConfirm('Revoke this invitation? Members with this code will no longer be able to join.', { danger: true })
      .then(() => revokeInvitation(orgId, inv.id).then(() => onRefresh()).catch((err: Error) => customAlert(err.message, 'error')))
      .catch(() => {});
  };

  const handleCopy = (code: string) => {
    const joinUrl = `${window.location.origin}/orgs/join/${code}`;
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const handleInviteUsers = async () => {
    if (selectedUsers.length === 0) return;
    setIsInviting(true);
    try {
      await inviteUsers(orgId, selectedUsers.map((u) => u.id));
      customAlert(`${selectedUsers.length} invitation(s) sent successfully!`, 'success');
      setSelectedUsers([]);
      onRefresh();
      onClose();
    } catch (err: any) {
      customAlert(err.message || 'Failed to send invitations', 'error');
    } finally {
      setIsInviting(false);
    }
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
        className="w-full max-w-[36rem] rounded-xl border border-tp-hairline-soft bg-tp-canvas p-6 shadow-elevation-4"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-tp-ink">Invite Members</h2>
          <button onClick={onClose} className="cursor-pointer text-tp-steel transition-colors hover:text-tp-ink">
            <Iconify icon="mdi:close" width={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-lg border border-tp-hairline-soft bg-tp-surface p-1">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'link'
                ? 'bg-tp-canvas text-tp-ink shadow-sm'
                : 'text-tp-steel hover:text-tp-ink'
            }`}
          >
            <Iconify icon="mdi:link" width={16} />
            Invite Link
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-tp-canvas text-tp-ink shadow-sm'
                : 'text-tp-steel hover:text-tp-ink'
            }`}
          >
            <Iconify icon="mdi:account-search" width={16} />
            Invite Users
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'link' ? (
          <div>
            <p className="mb-4 text-sm text-tp-steel">
              Share an invite link. Anyone with the link can join this organization as a member.
            </p>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mb-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-tp-primary px-4 py-2.5 text-sm font-medium text-tp-on-primary transition-colors hover:bg-tp-primary-deep disabled:opacity-50"
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
                    <button onClick={() => handleCopy(inv.code)} title="Copy invite link" className="cursor-pointer text-tp-ink transition-colors hover:text-tp-primary">
                      <Iconify icon={copiedCode === inv.code ? 'mdi:check' : 'mdi:content-copy'} width={14} />
                    </button>
                    <button onClick={() => handleRevoke(inv)} title="Revoke invitation" className="cursor-pointer text-tp-ink transition-colors hover:text-red-500">
                      <Iconify icon="mdi:trash-can-outline" width={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeInvitations.length === 0 && (
              <p className="text-center text-sm text-tp-ink">No active invitations.</p>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm text-tp-steel">
              Search for users by username to send them an invitation notification. They can accept directly from their inbox.
            </p>

            <div className="mb-4">
              <UserSearchInput
                selectedUsers={selectedUsers}
                onUsersChange={setSelectedUsers}
                placeholder="Type at least 4 characters to search..."
                maxUsers={20}
              />
            </div>

            {selectedUsers.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-tp-ink">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </p>
                <p className="mb-3 text-xs text-tp-steel">
                  An invitation link will be generated with {selectedUsers.length} use{selectedUsers.length !== 1 ? 's' : ''} and each user will receive a notification.
                </p>
              </div>
            )}

            <button
              onClick={handleInviteUsers}
              disabled={selectedUsers.length === 0 || isInviting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-tp-primary px-4 py-2.5 text-sm font-medium text-tp-on-primary transition-colors hover:bg-tp-primary-deep disabled:opacity-50"
            >
              <Iconify icon="mdi:send" width={18} />
              {isInviting ? 'Sending...' : `Send Invitation${selectedUsers.length > 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
