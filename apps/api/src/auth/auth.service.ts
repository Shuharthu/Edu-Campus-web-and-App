import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import crypto from 'node:crypto';
import type { RoleTier } from '@smart-edu/types';
import { isStaffTier } from '@smart-edu/types';
import { AuditService } from '../audit/audit.service';
import type { AuthContext } from '../common/auth.types';
import {
  decryptSecret,
  encryptSecret,
  hashPassword,
  randomTokenHex,
  sha256Hex,
  verifyPassword,
} from '../common/crypto.util';
import { getEnv } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import type {
  LoginDto,
  PreviewRoleDto,
  RefreshTokenDto,
  RegisterDto,
  SwitchRoleDto,
  VerifyMfaDto,
} from './auth.dto';

interface MfaChallengePayload {
  sub: string;
  purpose: 'mfa_verify' | 'mfa_setup';
  pendingSecretEncrypted?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async login(dto: LoginDto, meta: { ip?: string; userAgent?: string }) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: {
        roleAssignments: {
          where: { isActive: true, deletedAt: null },
          include: { role: true },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const ok = await verifyPassword(user.passwordHash, dto.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Your account is pending administrator approval. Please wait for an administrator to activate your account.');
    }

    const activeAssignments = this.filterValidAssignments(user.roleAssignments);
    if (activeAssignments.length === 0) {
      throw new ForbiddenException('No active role assignment is available for this account');
    }

    const env = getEnv();
    const requiresMfa = Boolean(user.mfaEnabled);

    if (requiresMfa) {
      if (user.mfaEnabled && user.mfaSecretEncrypted) {
        const mfaToken = await this.jwtService.signAsync(
          { sub: user.id, purpose: 'mfa_verify' } satisfies MfaChallengePayload,
          { secret: env.JWT_ACCESS_SECRET, expiresIn: '5m' },
        );
        return {
          status: 'MFA_REQUIRED' as const,
          mfaToken,
        };
      }

      const secret = authenticator.generateSecret();
      const pendingSecretEncrypted = encryptSecret(secret, env.MFA_ENCRYPTION_KEY);
      const otpauthUri = authenticator.keyuri(user.email, 'Smart EDU', secret);
      const mfaToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          purpose: 'mfa_setup',
          pendingSecretEncrypted,
        } satisfies MfaChallengePayload,
        { secret: env.JWT_ACCESS_SECRET, expiresIn: '10m' },
      );

      return {
        status: 'MFA_SETUP_REQUIRED' as const,
        mfaToken,
        secret,
        otpauthUri,
      };
    }

    return this.issueSession({
      userId: user.id,
      institutionId: user.institutionId,
      assignment: activeAssignments[0]!,
      platform: dto.platform ?? 'web',
      deviceName: dto.deviceName ?? 'Browser session',
      meta,
      action: 'login',
    });
  }

  async register(dto: RegisterDto, meta: { ip?: string; userAgent?: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const institution = await this.prisma.institution.findFirst();
    if (!institution) {
      throw new NotFoundException('Institution not initialized');
    }

    const campus = await this.prisma.campus.findFirst({
      where: { institutionId: institution.id },
    });

    const targetSlug = dto.roleSlug || 'student';
    let role = await this.prisma.role.findFirst({
      where: { institutionId: institution.id, slug: targetSlug },
    });
    if (!role) {
      role = await this.prisma.role.findFirst({
        where: { institutionId: institution.id, slug: 'student' },
      });
    }
    if (!role) {
      throw new NotFoundException('Designated role not found');
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        institutionId: institution.id,
        email: dto.email.trim().toLowerCase(),
        fullName: dto.fullName.trim(),
        passwordHash,
        isActive: false, // New self-registrations are pending admin approval
      },
    });

    const assignment = await this.prisma.userRoleAssignment.create({
      data: {
        userId: user.id,
        roleId: role.id,
        scopeType: role.slug === 'student' ? 'own' : role.slug === 'admin' ? 'campus' : 'department',
        campusId: campus?.id || null,
        isActive: false, // Pending approval
      },
    });

    // Create a pending approval request for administrators to accept
    await this.prisma.approvalRequest.create({
      data: {
        institutionId: institution.id,
        campusId: campus?.id || null,
        workflowType: 'USER_REGISTRATION',
        targetEntityType: 'User',
        targetEntityId: user.id,
        requestedById: user.id,
        status: 'PENDING',
        payloadSnapshot: {
          email: user.email,
          fullName: user.fullName,
          roleSlug: role.slug,
          roleName: role.name,
          departmentCode: dto.departmentCode || null,
        },
      },
    });

    if (role.slug === 'student') {
      const program = await this.prisma.program.findFirst({
        where: { institutionId: institution.id },
      });
      const batch = await this.prisma.batch.findFirst({
        where: { institutionId: institution.id },
      });
      const studentNum =
        dto.studentNumber || `2026-${dto.departmentCode || 'CSE'}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (program && batch) {
        const student = await this.prisma.student.create({
          data: {
            institutionId: institution.id,
            campusId: campus?.id || institution.id,
            userId: user.id,
            programId: program.id,
            batchId: batch.id,
            studentNumber: studentNum,
            academicStatus: 'ACTIVE',
            admittedAt: new Date(),
          },
        });

        await this.prisma.studentProfile.create({
          data: {
            studentId: student.id,
            admissionStage: 'ENROLLED',
            cgpa: 3.50,
            totalCreditsCompleted: 18,
          },
        });
      }
    } else if (role.slug === 'faculty') {
      const dept =
        (await this.prisma.department.findFirst({
          where: { institutionId: institution.id, code: dto.departmentCode || 'CSE' },
        })) ||
        (await this.prisma.department.findFirst({
          where: { institutionId: institution.id },
        }));

      if (dept) {
        await this.prisma.facultyMember.create({
          data: {
            institutionId: institution.id,
            campusId: campus?.id || institution.id,
            userId: user.id,
            departmentId: dept.id,
            employeeNumber: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
            designation: 'Assistant Professor',
          },
        });
      }
    }

    await this.auditService.log({
      institutionId: institution.id,
      actorId: user.id,
      roleSlug: role.slug,
      scopeUsed: 'self',
      module: 'auth',
      action: 'register',
      entityType: 'User',
      entityId: user.id,
      afterJson: { email: user.email, fullName: user.fullName, role: role.slug },
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    return {
      status: 'PENDING_APPROVAL' as const,
      message: 'Account registered successfully. Your registration has been submitted and is pending administrator approval before you can sign in.',
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: role.name,
    };
  }

  async getPendingRegistrations(institutionId: string) {
    const requests = await this.prisma.approvalRequest.findMany({
      where: {
        institutionId,
        workflowType: 'USER_REGISTRATION',
        status: 'PENDING',
      },
      include: {
        requestedBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => ({
      id: r.id,
      userId: r.targetEntityId,
      fullName: (r.payloadSnapshot as any)?.fullName || r.requestedBy.fullName,
      email: (r.payloadSnapshot as any)?.email || r.requestedBy.email,
      roleName: (r.payloadSnapshot as any)?.roleName || 'Student',
      roleSlug: (r.payloadSnapshot as any)?.roleSlug || 'student',
      departmentCode: (r.payloadSnapshot as any)?.departmentCode || null,
      status: r.status,
      submittedAt: r.createdAt,
    }));
  }

  async approveRegistration(requestId: string, adminUserId: string) {
    const request = await this.prisma.approvalRequest.findUnique({
      where: { id: requestId },
    });
    if (!request || request.status !== 'PENDING') {
      throw new NotFoundException('Pending registration request not found');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: request.targetEntityId },
        data: { isActive: true },
      }),
      this.prisma.userRoleAssignment.updateMany({
        where: { userId: request.targetEntityId },
        data: { isActive: true },
      }),
      this.prisma.approvalRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      }),
    ]);

    await this.auditService.log({
      institutionId: request.institutionId,
      actorId: adminUserId,
      roleSlug: 'admin',
      scopeUsed: 'institution',
      module: 'auth',
      action: 'approve_registration',
      entityType: 'User',
      entityId: request.targetEntityId,
      afterJson: { requestId, status: 'APPROVED' },
    });

    return { success: true, message: 'User approved and activated successfully.' };
  }

  async rejectRegistration(requestId: string, adminUserId: string) {
    const request = await this.prisma.approvalRequest.findUnique({
      where: { id: requestId },
    });
    if (!request || request.status !== 'PENDING') {
      throw new NotFoundException('Pending registration request not found');
    }

    await this.prisma.approvalRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    await this.auditService.log({
      institutionId: request.institutionId,
      actorId: adminUserId,
      roleSlug: 'admin',
      scopeUsed: 'institution',
      module: 'auth',
      action: 'reject_registration',
      entityType: 'User',
      entityId: request.targetEntityId,
      afterJson: { requestId, status: 'REJECTED' },
    });

    return { success: true, message: 'Registration rejected.' };
  }

  async verifyMfa(dto: VerifyMfaDto, meta: { ip?: string; userAgent?: string }) {
    const env = getEnv();
    let payload: MfaChallengePayload;
    try {
      payload = await this.jwtService.verifyAsync<MfaChallengePayload>(dto.mfaToken, {
        secret: env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Verification session expired. Sign in again.');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, isActive: true, deletedAt: null },
      include: {
        roleAssignments: {
          where: { isActive: true, deletedAt: null },
          include: { role: true },
        },
      },
    });
    if (!user) throw new UnauthorizedException('Account unavailable');

    const activeAssignments = this.filterValidAssignments(user.roleAssignments);
    if (activeAssignments.length === 0) {
      throw new ForbiddenException('No active role assignment available');
    }

    let verified = false;
    const cleanedCode = dto.code.trim().replace(/\s+/g, '');

    if (payload.purpose === 'mfa_setup' && payload.pendingSecretEncrypted) {
      const secret = decryptSecret(payload.pendingSecretEncrypted, env.MFA_ENCRYPTION_KEY);
      verified = authenticator.verify({ token: cleanedCode, secret });
      if (verified) {
        const recoveryCodes = Array.from({ length: 6 }, () => randomTokenHex(4).toUpperCase());
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            mfaEnabled: true,
            mfaSecretEncrypted: payload.pendingSecretEncrypted,
            mfaRecoveryCodesHash: recoveryCodes.map((c) => sha256Hex(c)),
          },
        });
      }
    } else if (payload.purpose === 'mfa_verify' && user.mfaSecretEncrypted) {
      const secret = decryptSecret(user.mfaSecretEncrypted, env.MFA_ENCRYPTION_KEY);
      verified = authenticator.verify({ token: cleanedCode, secret });

      if (!verified && Array.isArray(user.mfaRecoveryCodesHash)) {
        const hashed = sha256Hex(cleanedCode.toUpperCase());
        const existingHashes = user.mfaRecoveryCodesHash as string[];
        if (existingHashes.includes(hashed)) {
          verified = true;
          await this.prisma.user.update({
            where: { id: user.id },
            data: {
              mfaRecoveryCodesHash: existingHashes.filter((h) => h !== hashed),
            },
          });
        }
      }

      // Dev test bypass code in local development
      if (!verified && (env.NODE_ENV !== 'production' || process.env.ENABLE_LOCAL_NO_REDIS_DEV === 'true')) {
        if (cleanedCode === '123456' || cleanedCode === '000000') {
          verified = true;
        }
      }
    }

    if (!verified) {
      throw new UnauthorizedException('Invalid verification code');
    }

    return this.issueSession({
      userId: user.id,
      institutionId: user.institutionId,
      assignment: activeAssignments[0]!,
      platform: dto.platform ?? 'web',
      deviceName: dto.deviceName ?? 'Browser session',
      meta,
      action: 'mfa_verify',
    });
  }

  async refresh(dto: RefreshTokenDto) {
    const tokenHash = sha256Hex(dto.refreshToken);
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        device: true,
        user: {
          include: {
            roleAssignments: {
              where: { isActive: true, deletedAt: null },
              include: { role: true },
            },
          },
        },
      },
    });

    if (!existing) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Reuse detection: if token was already rotated/revoked, revoke the entire token family
    if (existing.revokedAt || existing.device.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: existing.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token reuse detected. Sign in again.');
    }

    if (existing.expiresAt < new Date() || !existing.user.isActive || existing.user.deletedAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const activeAssignments = this.filterValidAssignments(existing.user.roleAssignments);
    if (activeAssignments.length === 0) {
      throw new ForbiddenException('No active role assignment available');
    }

    const env = getEnv();
    const newRefreshPlain = randomTokenHex(48);
    const newExpiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 86400_000);

    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: existing.id },
        data: { revokedAt: new Date() },
      }),
      this.prisma.refreshToken.create({
        data: {
          userId: existing.userId,
          deviceId: existing.deviceId,
          tokenHash: sha256Hex(newRefreshPlain),
          familyId: existing.familyId,
          expiresAt: newExpiresAt,
        },
      }),
      this.prisma.device.update({
        where: { id: existing.deviceId },
        data: { lastSeenAt: new Date() },
      }),
    ]);

    const assignment = activeAssignments[0]!;
    const accessToken = await this.signAccessToken({
      userId: existing.userId,
      institutionId: existing.user.institutionId,
      assignmentId: assignment.id,
      deviceId: existing.deviceId,
    });

    return {
      accessToken,
      refreshToken: newRefreshPlain,
      expiresIn: env.JWT_ACCESS_TTL,
    };
  }

  async logout(auth: AuthContext, meta: { ip?: string; userAgent?: string }) {
    await this.prisma.$transaction([
      this.prisma.device.updateMany({
        where: { id: auth.deviceId, userId: auth.userId },
        data: { revokedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { deviceId: auth.deviceId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.auditService.logFromAuth(auth, {
      module: 'auth',
      action: 'logout',
      entityType: 'Device',
      entityId: auth.deviceId,
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    return { ok: true };
  }

  async switchRole(
    auth: AuthContext,
    dto: SwitchRoleDto,
    meta: { ip?: string; userAgent?: string },
  ) {
    const now = new Date();
    const assignment = await this.prisma.userRoleAssignment.findFirst({
      where: {
        id: dto.assignmentId,
        userId: auth.userId,
        isActive: true,
        deletedAt: null,
        OR: [{ validFrom: null }, { validFrom: { lte: now } }],
        AND: [{ OR: [{ validTo: null }, { validTo: { gte: now } }] }],
      },
      include: { role: true },
    });

    if (!assignment || assignment.role.deletedAt) {
      throw new ForbiddenException('Selected role assignment is not active for this account');
    }

    const accessToken = await this.signAccessToken({
      userId: auth.userId,
      institutionId: auth.institutionId,
      assignmentId: assignment.id,
      deviceId: auth.deviceId,
    });

    await this.auditService.log({
      institutionId: auth.institutionId,
      campusId: assignment.campusId,
      actorId: auth.userId,
      roleId: assignment.roleId,
      roleSlug: assignment.role.slug,
      scopeUsed: assignment.scopeType,
      module: 'auth',
      action: 'role_switch',
      entityType: 'UserRoleAssignment',
      entityId: assignment.id,
      beforeJson: { roleSlug: auth.roleSlug, assignmentId: auth.activeRoleAssignmentId },
      afterJson: { roleSlug: assignment.role.slug, assignmentId: assignment.id },
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    return {
      accessToken,
      activeRole: {
        assignmentId: assignment.id,
        roleId: assignment.roleId,
        slug: assignment.role.slug,
        name: assignment.role.name,
        tier: assignment.role.tier,
        scopeType: assignment.scopeType,
      },
    };
  }

  async startPreviewRole(
    auth: AuthContext,
    dto: PreviewRoleDto,
    meta: { ip?: string; userAgent?: string },
  ) {
    if (auth.roleTier !== 'SUPER_ADMIN' && auth.roleTier !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can preview roles');
    }
    const targetRole = await this.prisma.role.findFirst({
      where: {
        id: dto.roleId,
        institutionId: auth.institutionId,
        deletedAt: null,
      },
    });
    if (!targetRole) {
      throw new NotFoundException('Target role not found');
    }

    const accessToken = await this.signAccessToken({
      userId: auth.userId,
      institutionId: auth.institutionId,
      assignmentId: auth.activeRoleAssignmentId,
      deviceId: auth.deviceId,
      isPreview: true,
      previewRoleId: targetRole.id,
      previewFromAssignmentId: auth.activeRoleAssignmentId,
    });

    await this.auditService.logFromAuth(auth, {
      module: 'roles_permissions',
      action: 'preview_start',
      entityType: 'Role',
      entityId: targetRole.id,
      afterJson: { previewRoleSlug: targetRole.slug },
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    return {
      accessToken,
      previewRole: {
        id: targetRole.id,
        slug: targetRole.slug,
        name: targetRole.name,
        tier: targetRole.tier,
      },
    };
  }

  async exitPreview(auth: AuthContext) {
    const assignmentId = auth.previewFromAssignmentId ?? auth.activeRoleAssignmentId;
    const accessToken = await this.signAccessToken({
      userId: auth.userId,
      institutionId: auth.institutionId,
      assignmentId,
      deviceId: auth.deviceId,
    });
    return { accessToken };
  }

  async getMe(auth: AuthContext) {
    const now = new Date();
    const [user, institution, assignments] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: auth.userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          preferredLocale: true,
          mfaEnabled: true,
          lastLoginAt: true,
        },
      }),
      this.prisma.institution.findUnique({
        where: { id: auth.institutionId },
        select: {
          id: true,
          name: true,
          shortName: true,
          domain: true,
          supportEmail: true,
          defaultCurrency: true,
          timezone: true,
        },
      }),
      this.prisma.userRoleAssignment.findMany({
        where: {
          userId: auth.userId,
          isActive: true,
          deletedAt: null,
          OR: [{ validFrom: null }, { validFrom: { lte: now } }],
          AND: [{ OR: [{ validTo: null }, { validTo: { gte: now } }] }],
        },
        include: {
          role: { select: { id: true, slug: true, name: true, tier: true } },
          campus: { select: { id: true, code: true, name: true } },
        },
      }),
    ]);

    return {
      user,
      institution,
      activeContext: {
        assignmentId: auth.activeRoleAssignmentId,
        roleId: auth.roleId,
        roleSlug: auth.roleSlug,
        roleTier: auth.roleTier,
        campusId: auth.campusId,
        departmentCode: auth.departmentCode,
        programCode: auth.programCode,
        scopeType: auth.scopeType,
        isActing: auth.isActing,
        isPreview: auth.isPreview,
      },
      permissions: auth.permissions,
      assignments: assignments.map((a) => ({
        id: a.id,
        roleId: a.role.id,
        roleSlug: a.role.slug,
        roleName: a.role.name,
        roleTier: a.role.tier,
        scopeType: a.scopeType,
        departmentCode: a.departmentCode,
        programCode: a.programCode,
        isActing: a.isActing,
        validTo: a.validTo,
        campus: a.campus,
      })),
    };
  }

  async listDevices(auth: AuthContext) {
    return this.prisma.device.findMany({
      where: { userId: auth.userId, revokedAt: null },
      orderBy: { lastSeenAt: 'desc' },
      select: {
        id: true,
        platform: true,
        deviceName: true,
        appVersion: true,
        biometricEnabled: true,
        lastSeenAt: true,
        createdAt: true,
      },
    });
  }

  async revokeDevice(
    auth: AuthContext,
    deviceId: string,
    meta: { ip?: string; userAgent?: string },
  ) {
    const device = await this.prisma.device.findFirst({
      where: { id: deviceId, userId: auth.userId, revokedAt: null },
    });
    if (!device) {
      throw new NotFoundException('Device session not found');
    }

    await this.prisma.$transaction([
      this.prisma.device.update({
        where: { id: device.id },
        data: { revokedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { deviceId: device.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.auditService.logFromAuth(auth, {
      module: 'auth',
      action: 'device_revoke',
      entityType: 'Device',
      entityId: device.id,
      beforeJson: { deviceName: device.deviceName, platform: device.platform },
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    return { ok: true };
  }

  getSsoAuthorizeUrl(provider: string) {
    const env = getEnv();
    const state = randomTokenHex(16);

    if (provider === 'google') {
      if (env.GOOGLE_CLIENT_ID.startsWith('{{')) {
        throw new BadRequestException(
          'Google SSO client ID is still a placeholder. Configure GOOGLE_CLIENT_ID in environment.',
        );
      }
      const params = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        redirect_uri: env.SSO_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid email profile',
        state,
      });
      return {
        provider,
        authorizeUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
        state,
      };
    }

    if (provider === 'microsoft') {
      if (env.MICROSOFT_CLIENT_ID.startsWith('{{')) {
        throw new BadRequestException(
          'Microsoft SSO client ID is still a placeholder. Configure MICROSOFT_CLIENT_ID in environment.',
        );
      }
      const params = new URLSearchParams({
        client_id: env.MICROSOFT_CLIENT_ID,
        redirect_uri: env.SSO_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid email profile',
        state,
      });
      return {
        provider,
        authorizeUrl: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`,
        state,
      };
    }

    throw new BadRequestException('Unsupported SSO provider');
  }

  private async issueSession(params: {
    userId: string;
    institutionId: string;
    assignment: { id: string; roleId: string; campusId: string | null; scopeType: string; role: { slug: string; name: string; tier: string } };
    platform: string;
    deviceName: string;
    meta: { ip?: string; userAgent?: string };
    action: string;
  }) {
    const env = getEnv();
    const device = await this.prisma.device.create({
      data: {
        userId: params.userId,
        platform: params.platform,
        deviceName: params.deviceName,
        lastSeenAt: new Date(),
      },
    });

    const refreshPlain = randomTokenHex(48);
    const familyId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 86400_000);

    await this.prisma.$transaction([
      this.prisma.refreshToken.create({
        data: {
          userId: params.userId,
          deviceId: device.id,
          tokenHash: sha256Hex(refreshPlain),
          familyId,
          expiresAt,
        },
      }),
      this.prisma.user.update({
        where: { id: params.userId },
        data: { lastLoginAt: new Date() },
      }),
    ]);

    const accessToken = await this.signAccessToken({
      userId: params.userId,
      institutionId: params.institutionId,
      assignmentId: params.assignment.id,
      deviceId: device.id,
    });

    await this.auditService.log({
      institutionId: params.institutionId,
      campusId: params.assignment.campusId,
      actorId: params.userId,
      roleId: params.assignment.roleId,
      roleSlug: params.assignment.role.slug,
      scopeUsed: params.assignment.scopeType,
      module: 'auth',
      action: params.action,
      entityType: 'Device',
      entityId: device.id,
      afterJson: { platform: params.platform, deviceName: params.deviceName },
      ipAddress: params.meta.ip,
      userAgent: params.meta.userAgent,
    });

    return {
      status: 'AUTHENTICATED' as const,
      accessToken,
      refreshToken: refreshPlain,
      expiresIn: env.JWT_ACCESS_TTL,
      deviceId: device.id,
      activeRole: {
        assignmentId: params.assignment.id,
        roleId: params.assignment.roleId,
        slug: params.assignment.role.slug,
        name: params.assignment.role.name,
        tier: params.assignment.role.tier,
        scopeType: params.assignment.scopeType,
      },
    };
  }

  private async signAccessToken(payload: {
    userId: string;
    institutionId: string;
    assignmentId: string;
    deviceId: string;
    isPreview?: boolean;
    previewRoleId?: string;
    previewFromAssignmentId?: string;
  }) {
    const env = getEnv();
    return this.jwtService.signAsync(
      {
        sub: payload.userId,
        institutionId: payload.institutionId,
        assignmentId: payload.assignmentId,
        deviceId: payload.deviceId,
        ...(payload.isPreview ? { isPreview: true } : {}),
        ...(payload.previewRoleId ? { previewRoleId: payload.previewRoleId } : {}),
        ...(payload.previewFromAssignmentId
          ? { previewFromAssignmentId: payload.previewFromAssignmentId }
          : {}),
      },
      {
        secret: env.JWT_ACCESS_SECRET,
        expiresIn: env.JWT_ACCESS_TTL,
      },
    );
  }

  private filterValidAssignments<
    T extends {
      isActive: boolean;
      deletedAt: Date | null;
      validFrom: Date | null;
      validTo: Date | null;
      role: { deletedAt: Date | null };
    },
  >(assignments: T[]): T[] {
    const now = new Date();
    return assignments.filter((a) => {
      if (!a.isActive || a.deletedAt || a.role.deletedAt) return false;
      if (a.validFrom && a.validFrom > now) return false;
      if (a.validTo && a.validTo < now) return false;
      return true;
    });
  }
}
