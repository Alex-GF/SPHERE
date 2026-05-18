import { useCallback, useEffect, useState } from 'react';
import Iconify from '../../../core/components/iconify';
import customAlert from '../../../core/utils/custom-alert';
import { useOrganizationsApi, OrgMemberWithUser } from '../../api/organizationsApi';
import { EntityType, EntityPermission, EntityPermissions } from '../../types/permissions';

interface PermissionsTabProps {
  organizationId: string;
  canManage: boolean;
}

const PERMISSION_LABELS: Record<keyof EntityPermissions, string> = {
  GET: 'Read',
  PUT: 'Edit',
  DELETE: 'Delete',
};

const PERMISSION_COLORS: Record<keyof EntityPermissions, string> = {
  GET: 'bg-emerald-100 text-emerald-800',
  PUT: 'bg-amber-100 text-amber-800',
  DELETE: 'bg-red-100 text-red-800',
};

export default function PermissionsTab({ organizationId, canManage }: PermissionsTabProps) {
  const { getOrgMembers, getOrgPermissions, setOrgPermission, removeOrgPermission } = useOrganizationsApi();
  const [members, setMembers] = useState<OrgMemberWithUser[]>([]);
  const [permissions, setPermissions] = useState<EntityPermission[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [entityType, setEntityType] = useState<EntityType>('pricing');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [membersData, permissionsData] = await Promise.all([
        getOrgMembers(organizationId),
        getOrgPermissions(organizationId, entityType),
      ]);
      setMembers(membersData);
      setPermissions(permissionsData);
      if (!selectedMemberId && membersData.length > 0) {
        setSelectedMemberId(membersData[0].user.id);
      }
    } catch (err: any) {
      customAlert(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, entityType, getOrgMembers, getOrgPermissions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTogglePermission = useCallback(async (
    permissionType: keyof EntityPermissions,
    permission: EntityPermission
  ) => {
    if (!canManage || !selectedMemberId) return;

    const newPermissions = { ...permission.permissions };
    newPermissions[permissionType] = !newPermissions[permissionType];

    setIsSaving(permission.id);
    try {
      await setOrgPermission(organizationId, {
        userId: selectedMemberId,
        entityType: permission.entityType,
        entityId: permission.entityId,
        permissions: newPermissions,
      });
      setPermissions(prev =>
        prev.map(p => p.id === permission.id ? { ...p, permissions: newPermissions } : p)
      );
    } catch (err: any) {
      customAlert(err.message);
    } finally {
      setIsSaving(null);
    }
  }, [canManage, selectedMemberId, organizationId, setOrgPermission]);

  const handleRemovePermission = useCallback(async (permissionId: string) => {
    if (!canManage) return;

    setIsSaving(permissionId);
    try {
      await removeOrgPermission(organizationId, permissionId);
      setPermissions(prev => prev.filter(p => p.id !== permissionId));
    } catch (err: any) {
      customAlert(err.message);
    } finally {
      setIsSaving(null);
    }
  }, [canManage, organizationId, removeOrgPermission]);

  const selectedMember = members.find(m => m.user.id === selectedMemberId);
  const isOwnerOrAdmin = selectedMember?.role === 'OWNER' || selectedMember?.role === 'ADMIN';

  const filteredPermissions = permissions.filter(p => p.entityType === entityType);

  return (
    <div className="rounded-xl border border-sphere-grey-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-sphere-grey-800">Entity Permissions</h2>
        <p className="text-sm text-sphere-grey-500">
          Configure which pricings and collections each member can access.
        </p>
      </div>

      {/* Entity type selector */}
      <div className="mb-4 flex gap-2">
        {(['pricing', 'collection'] as EntityType[]).map(type => (
          <button
            key={type}
            type="button"
            onClick={() => setEntityType(type)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize cursor-pointer transition-colors ${
              entityType === type
                ? 'bg-sphere-primary-800 text-white'
                : 'border border-sphere-grey-300 text-sphere-grey-700 hover:bg-sphere-grey-100'
            }`}
          >
            {type === 'pricing' ? 'Pricings' : 'Collections'}
          </button>
        ))}
      </div>

      {/* Member selector */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-semibold text-sphere-grey-700">
          Select member
        </label>
        <select
          value={selectedMemberId ?? ''}
          onChange={e => setSelectedMemberId(e.target.value)}
          className="w-full rounded-md border border-sphere-grey-300 px-3 py-2 text-sm outline-none focus:border-sphere-primary-500 focus:ring-1 focus:ring-sphere-primary-500"
        >
          {members.map(m => (
            <option key={m.user.id} value={m.user.id}>
              @{m.user.username} ({m.role})
            </option>
          ))}
        </select>
      </div>

      {/* Owner/Admin full access notice */}
      {isOwnerOrAdmin && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-sphere-primary-200 bg-sphere-primary-50 px-4 py-3">
          <Iconify icon="mdi:shield-check-outline" width={20} className="text-sphere-primary-800" />
          <p className="text-sm text-sphere-primary-800">
            <span className="font-semibold">{selectedMember?.role}</span> users have full access to all {entityType === 'pricing' ? 'pricings' : 'collections'} in this organization.
          </p>
        </div>
      )}

      {/* Permissions table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-sphere-grey-400">
          <Iconify icon="mdi:loading" width={24} className="animate-spin" />
        </div>
      ) : filteredPermissions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-sphere-grey-400">
          <Iconify icon="mdi:shield-lock-outline" width={36} />
          <p className="text-sm">No {entityType === 'pricing' ? 'pricing' : 'collection'} permissions configured yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sphere-grey-200">
                <th className="px-3 py-2 text-left font-semibold text-sphere-grey-700">Name</th>
                {(['GET', 'PUT', 'DELETE'] as const).map(perm => (
                  <th key={perm} className="px-3 py-2 text-center font-semibold text-sphere-grey-700">
                    {PERMISSION_LABELS[perm]}
                  </th>
                ))}
                {canManage && <th className="px-3 py-2"></th>}
              </tr>
            </thead>
            <tbody>
              {filteredPermissions.map(permission => (
                <tr key={permission.id} className="border-b border-sphere-grey-100">
                  <td className="px-3 py-2 font-medium text-sphere-grey-800">
                    {permission.entityName ?? 'Unknown'}
                  </td>
                  {(['GET', 'PUT', 'DELETE'] as const).map(perm => (
                    <td key={perm} className="px-3 py-2 text-center">
                      {canManage && !isOwnerOrAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleTogglePermission(perm, permission)}
                          disabled={isSaving === permission.id}
                          className={`inline-flex items-center justify-center rounded-full p-1 transition-colors cursor-pointer ${
                            permission.permissions[perm]
                              ? PERMISSION_COLORS[perm]
                              : 'bg-sphere-grey-100 text-sphere-grey-400'
                          } ${isSaving === permission.id ? 'opacity-50' : 'hover:opacity-80'}`}
                          title={`${permission.permissions[perm] ? 'Revoke' : 'Grant'} ${PERMISSION_LABELS[perm]} permission`}
                        >
                          <Iconify
                            icon={permission.permissions[perm] ? 'mdi:check' : 'mdi:close'}
                            width={14}
                          />
                        </button>
                      ) : (
                        <span
                          className={`inline-flex items-center justify-center rounded-full p-1 ${
                            permission.permissions[perm]
                              ? PERMISSION_COLORS[perm]
                              : 'bg-sphere-grey-100 text-sphere-grey-400'
                          }`}
                        >
                          <Iconify
                            icon={permission.permissions[perm] ? 'mdi:check' : 'mdi:close'}
                            width={14}
                          />
                        </span>
                      )}
                    </td>
                  ))}
                  {canManage && !isOwnerOrAdmin && (
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemovePermission(permission.id)}
                        disabled={isSaving === permission.id}
                        className="text-sphere-grey-300 hover:text-red-500 cursor-pointer"
                        title="Remove permission"
                      >
                        <Iconify icon="mdi:trash-can-outline" width={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
