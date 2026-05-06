import crypto from 'node:crypto';
import container from '../config/container';
import OrganizationRepository from '../repositories/mongoose/OrganizationRepository';
import OrganizationMembershipRepository from '../repositories/mongoose/OrganizationMembershipRepository';
import OrganizationInvitationRepository from '../repositories/mongoose/OrganizationInvitationRepository';
import { OrgRole } from '../types/models/Organization';
import { LeanUser } from '../types/models/User';

class OrganizationService {
  private organizationRepository: OrganizationRepository;
  private organizationMembershipRepository: OrganizationMembershipRepository;
  private organizationInvitationRepository: OrganizationInvitationRepository;

  constructor() {
    this.organizationRepository = container.resolve('organizationRepository');
    this.organizationMembershipRepository = container.resolve('organizationMembershipRepository');
    this.organizationInvitationRepository = container.resolve('organizationInvitationRepository');
  }

  async index() {
    return this.organizationRepository.findAll({});
  }

  async indexByUser(userId: string) {
    const memberships = await this.organizationMembershipRepository.findByUserId(userId);
    return memberships.map((m: any) => m.organization);
  }
  
  async getUserOrgRole(userId: string, organizationId: string): Promise<OrgRole | null> {
    const role = await this.organizationMembershipRepository.findUserRoleInOrganization(userId, organizationId);
    return role;
  }

  async show(id: string) {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) {
      throw new Error('NOT FOUND: Organization not found');
    }
    return organization;
  }

  async createWithOwner(data: any, userId: string) {
    const organization: any = await this.organizationRepository.create(data);
    await this.organizationMembershipRepository.create({
      _userId: userId,
      _organizationId: organization.id ?? organization._id?.toString(),
      role: 'OWNER',
      joinedAt: new Date(),
    });
    return organization;
  }

  async ensurePersonalOrganizationForUser(user: { id: string; username: string }) {
    const existing = await this.organizationRepository.findOne({ name: user.username, isPersonal: true });
    if (existing) {
      throw new Error(
        'CONFLICT: Cannot create personal organization because a personal organization with this name already exists. The user creation has been rolled back, but please contact support if you see this message as this should not happen under normal circumstances.'
      );
    }

    const organization = await this.organizationRepository.create({
      name: user.username.toLowerCase(),
      displayName: `${user.username} (personal)`,
      description: null,
      avatarUrl: null,
      isPersonal: true,
    });

    await this.organizationMembershipRepository.create({
      _userId: user.id,
      _organizationId: (organization as any).id,
      role: 'OWNER',
      joinedAt: new Date(),
    });

    return organization;
  }

  async update(id: string, data: any) {
    const organization = await this.organizationRepository.update(id, data);
    if (!organization) {
      throw new Error('NOT FOUND: Organization not found');
    }
    return organization;
  }

  async destroy(id: string, skipPersonalCheck = false) {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) {
      throw new Error('NOT FOUND: Organization not found');
    }

    if ((organization as any).isPersonal && !skipPersonalCheck) {
      throw new Error('PERMISSION ERROR: Personal organizations cannot be deleted');
    }

    await this.organizationMembershipRepository.destroyByOrganizationId(id);
    await this.organizationInvitationRepository.destroyByOrganizationId(id);
    const result = await this.organizationRepository.destroy(id);
    if (!result) {
      throw new Error('NOT FOUND: Organization not found');
    }
    return true;
  }

  async listMembers(organizationId: string, excludeUserId?: string) {
    const members = await this.organizationMembershipRepository.findByOrganizationId(organizationId);

    if (excludeUserId) {
      return members.filter((m: any) => m._userId !== excludeUserId);
    }

    return members;
  }

  async addMember(userId: string, organizationId: string, role: OrgRole) {
    const existing = await this.organizationMembershipRepository.findUserRoleInOrganization(userId, organizationId);
    if (existing) {
      throw new Error('INVALID DATA: User is already a member of this organization');
    }

    return this.organizationMembershipRepository.create({
      _userId: userId,
      _organizationId: organizationId,
      role,
      joinedAt: new Date(),
    });
  }

  async updateMemberRole(userId: string, organizationId: string, role: OrgRole, reqUser: LeanUser & {orgRole: OrgRole}) {

    if (reqUser.orgRole !== 'OWNER' && role === 'OWNER') {
      throw new Error('PERMISSION ERROR: Only OWNER users can promote others to OWNER role');
    }

    const membership = await this.organizationMembershipRepository.updateByUserAndOrganization(
      userId,
      organizationId,
      { role }
    );
    if (!membership) {
      throw new Error('NOT FOUND: Organization membership not found');
    }
    return membership;
  }

  async removeMember(userId: string, organizationId: string) {
    const result = await this.organizationMembershipRepository.destroyByUserAndOrganization(userId, organizationId);
    if (!result) {
      throw new Error('NOT FOUND: Organization membership not found');
    }
    return true;
  }

  async createInvitation(organizationId: string, userId: string, options?: { expiresInDays?: number; maxUses?: number }) {
    const code = crypto.randomBytes(5).toString('hex');
    const expiresInDays = options?.expiresInDays ?? 7;
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    return this.organizationInvitationRepository.create({
      _organizationId: organizationId,
      code,
      createdBy: userId,
      expiresAt,
      maxUses: options?.maxUses ?? null,
      useCount: 0,
    });
  }

  async listInvitations(organizationId: string) {
    return this.organizationInvitationRepository.findByOrganizationId(organizationId);
  }

  async revokeInvitation(invitationId: string) {
    const result = await this.organizationInvitationRepository.destroy(invitationId);
    if (!result) {
      throw new Error('NOT FOUND: Invitation not found');
    }
    return true;
  }

  async previewInvitation(code: string) {
    const invitation: any = await this.organizationInvitationRepository.findByCode(code);
    if (!invitation) {
      throw new Error('NOT FOUND: Invitation not found');
    }

    if (invitation.expiresAt && new Date(invitation.expiresAt as any) < new Date()) {
      throw new Error('NOT FOUND: Invitation expired');
    }

    if (invitation.maxUses !== null && invitation.useCount >= invitation.maxUses) {
      throw new Error('NOT FOUND: Invitation has reached the maximum number of uses');
    }

    const organization = await this.organizationRepository.findById(invitation._organizationId?.toString());
    if (!organization) {
      throw new Error('NOT FOUND: Organization not found');
    }

    return { invitation, organization };
  }

  async joinViaInvitation(code: string, userId: string) {
    const { invitation, organization } = await this.previewInvitation(code);
    const existing = await this.organizationMembershipRepository.findUserRoleInOrganization(userId, invitation._organizationId?.toString());

    if (existing) {
      throw new Error('INVALID DATA: User is already a member of this organization');
    }

    await this.organizationMembershipRepository.create({
      _userId: userId,
      _organizationId: invitation._organizationId?.toString(),
      role: 'MEMBER',
      joinedAt: new Date(),
    });

    await this.organizationInvitationRepository.incrementUseCount(invitation.id ?? invitation._id?.toString());

    return organization;
  }
}

export default OrganizationService;
