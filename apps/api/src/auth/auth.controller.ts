import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import type { AuthContext } from '../common/auth.types';
import { AllowInPreview, CurrentAuth, Public } from '../common/decorators';
import {
  LoginDto,
  PreviewRoleDto,
  RefreshTokenDto,
  RegisterDto,
  SwitchRoleDto,
  VerifyMfaDto,
} from './auth.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @Post('login')
  @ApiOperation({ summary: 'Authenticate with email and password' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register and create a new custom user account' })
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Public()
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @Post('mfa/verify')
  @ApiOperation({ summary: 'Verify staff TOTP MFA code or recovery code' })
  verifyMfa(@Body() dto: VerifyMfaDto, @Req() req: Request) {
    return this.authService.verifyMfa(dto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token and issue new access JWT' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Public()
  @Get('sso/:provider/url')
  @ApiOperation({ summary: 'Build Google or Microsoft OIDC authorization URL' })
  getSsoUrl(@Param('provider') provider: string) {
    return this.authService.getSsoAuthorizeUrl(provider);
  }

  @ApiBearerAuth()
  @AllowInPreview()
  @Post('logout')
  @ApiOperation({ summary: 'Sign out current device and revoke refresh tokens' })
  logout(@CurrentAuth() auth: AuthContext, @Req() req: Request) {
    return this.authService.logout(auth, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @ApiBearerAuth()
  @Post('switch-role')
  @ApiOperation({ summary: 'Switch active role assignment for multi-role account' })
  switchRole(
    @CurrentAuth() auth: AuthContext,
    @Body() dto: SwitchRoleDto,
    @Req() req: Request,
  ) {
    return this.authService.switchRole(auth, dto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @ApiBearerAuth()
  @Post('preview-role')
  @ApiOperation({ summary: 'Start read-only View as role preview session (Admins only)' })
  previewRole(
    @CurrentAuth() auth: AuthContext,
    @Body() dto: PreviewRoleDto,
    @Req() req: Request,
  ) {
    return this.authService.startPreviewRole(auth, dto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @ApiBearerAuth()
  @AllowInPreview()
  @Post('exit-preview')
  @ApiOperation({ summary: 'Exit View as role preview session' })
  exitPreview(@CurrentAuth() auth: AuthContext) {
    return this.authService.exitPreview(auth);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get authenticated profile, active role, permissions and switcher list' })
  me(@CurrentAuth() auth: AuthContext) {
    return this.authService.getMe(auth);
  }

  @ApiBearerAuth()
  @Get('devices')
  @ApiOperation({ summary: 'List active signed-in devices for current account' })
  devices(@CurrentAuth() auth: AuthContext) {
    return this.authService.listDevices(auth);
  }

  @ApiBearerAuth()
  @Delete('devices/:id')
  @ApiOperation({ summary: 'Remote sign out a specific device session' })
  revokeDevice(
    @CurrentAuth() auth: AuthContext,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.authService.revokeDevice(auth, id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @ApiBearerAuth()
  @Get('pending-registrations')
  @ApiOperation({ summary: 'List pending user registrations requiring admin approval' })
  getPendingRegistrations(@CurrentAuth() auth: AuthContext) {
    return this.authService.getPendingRegistrations(auth.institutionId);
  }

  @ApiBearerAuth()
  @Post('approve-registration/:id')
  @ApiOperation({ summary: 'Admin approves a pending registration' })
  approveRegistration(@Param('id') id: string, @CurrentAuth() auth: AuthContext) {
    return this.authService.approveRegistration(id, auth.userId);
  }

  @ApiBearerAuth()
  @Post('reject-registration/:id')
  @ApiOperation({ summary: 'Admin rejects a pending registration' })
  rejectRegistration(@Param('id') id: string, @CurrentAuth() auth: AuthContext) {
    return this.authService.rejectRegistration(id, auth.userId);
  }
}
