// AUTO-GENERATED FROM apps/api/openapi.json — DO NOT EDIT DIRECTLY
import 'package:dio/dio.dart';

class LoginDto {
  final String email;
  final String password;
  final String? platform;
  final String? deviceName;
  const LoginDto({required this.email, required this.password, this.platform, this.deviceName,});
  Map<String, dynamic> toJson() => {'email': email, 'password': password, 'platform': platform, 'deviceName': deviceName,};
}

class VerifyMfaDto {
  final String mfaToken;
  final String code;
  final String? platform;
  final String? deviceName;
  const VerifyMfaDto({required this.mfaToken, required this.code, this.platform, this.deviceName,});
  Map<String, dynamic> toJson() => {'mfaToken': mfaToken, 'code': code, 'platform': platform, 'deviceName': deviceName,};
}

class RefreshTokenDto {
  final String refreshToken;
  const RefreshTokenDto({required this.refreshToken,});
  Map<String, dynamic> toJson() => {'refreshToken': refreshToken,};
}

class SwitchRoleDto {
  final String assignmentId;
  const SwitchRoleDto({required this.assignmentId,});
  Map<String, dynamic> toJson() => {'assignmentId': assignmentId,};
}

class PreviewRoleDto {
  final String roleId;
  const PreviewRoleDto({required this.roleId,});
  Map<String, dynamic> toJson() => {'roleId': roleId,};
}

class CreateRoleDto {
  final String slug;
  final String name;
  final String? tier;
  final String? description;
  final List<String> permissionIds;
  const CreateRoleDto({required this.slug, required this.name, this.tier, this.description, required this.permissionIds,});
  Map<String, dynamic> toJson() => {'slug': slug, 'name': name, 'tier': tier, 'description': description, 'permissionIds': permissionIds,};
}

class UpdateRolePermissionsDto {
  final List<String> permissionIds;
  const UpdateRolePermissionsDto({required this.permissionIds,});
  Map<String, dynamic> toJson() => {'permissionIds': permissionIds,};
}

class AssignUserRoleDto {
  final String userId;
  final String roleId;
  final String? campusId;
  final String? departmentCode;
  final String? programCode;
  final String scopeType;
  final bool? isActing;
  final String? validFrom;
  final String? validTo;
  const AssignUserRoleDto({required this.userId, required this.roleId, this.campusId, this.departmentCode, this.programCode, required this.scopeType, this.isActing, this.validFrom, this.validTo,});
  Map<String, dynamic> toJson() => {'userId': userId, 'roleId': roleId, 'campusId': campusId, 'departmentCode': departmentCode, 'programCode': programCode, 'scopeType': scopeType, 'isActing': isActing, 'validFrom': validFrom, 'validTo': validTo,};
}

class DecideApprovalDto {
  final String decision;
  final String? comment;
  const DecideApprovalDto({required this.decision, this.comment,});
  Map<String, dynamic> toJson() => {'decision': decision, 'comment': comment,};
}

class UpdateInstitutionDto {
  final String? name;
  final String? shortName;
  final String? supportEmail;
  final String? timezone;
  final String? defaultCurrency;
  const UpdateInstitutionDto({this.name, this.shortName, this.supportEmail, this.timezone, this.defaultCurrency,});
  Map<String, dynamic> toJson() => {'name': name, 'shortName': shortName, 'supportEmail': supportEmail, 'timezone': timezone, 'defaultCurrency': defaultCurrency,};
}

class CreateCampusDto {
  final String code;
  final String name;
  final String? address;
  final String? timezone;
  const CreateCampusDto({required this.code, required this.name, this.address, this.timezone,});
  Map<String, dynamic> toJson() => {'code': code, 'name': name, 'address': address, 'timezone': timezone,};
}

class ToggleFeatureFlagDto {
  final bool enabled;
  const ToggleFeatureFlagDto({required this.enabled,});
  Map<String, dynamic> toJson() => {'enabled': enabled,};
}

class SmartEduDartApiClient {
  final Dio _dio;
  SmartEduDartApiClient(this._dio);

  Future<Response<dynamic>> auditList() {
    return _dio.request('/audit-logs', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> auditExportCsv() {
    return _dio.request('/audit-logs/export.csv', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> authLogin(LoginDto body) {
    return _dio.request('/auth/login', options: Options(method: 'POST'), data: body.toJson());
  }

  Future<Response<dynamic>> authVerifyMfa(VerifyMfaDto body) {
    return _dio.request('/auth/mfa/verify', options: Options(method: 'POST'), data: body.toJson());
  }

  Future<Response<dynamic>> authRefresh(RefreshTokenDto body) {
    return _dio.request('/auth/refresh', options: Options(method: 'POST'), data: body.toJson());
  }

  Future<Response<dynamic>> authGetSsoUrl(String provider) {
    return _dio.request('/auth/sso/${provider}/url', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> authLogout() {
    return _dio.request('/auth/logout', options: Options(method: 'POST'));
  }

  Future<Response<dynamic>> authSwitchRole(SwitchRoleDto body) {
    return _dio.request('/auth/switch-role', options: Options(method: 'POST'), data: body.toJson());
  }

  Future<Response<dynamic>> authPreviewRole(PreviewRoleDto body) {
    return _dio.request('/auth/preview-role', options: Options(method: 'POST'), data: body.toJson());
  }

  Future<Response<dynamic>> authExitPreview() {
    return _dio.request('/auth/exit-preview', options: Options(method: 'POST'));
  }

  Future<Response<dynamic>> authMe() {
    return _dio.request('/auth/me', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> authDevices() {
    return _dio.request('/auth/devices', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> authRevokeDevice(String id) {
    return _dio.request('/auth/devices/${id}', options: Options(method: 'DELETE'));
  }

  Future<Response<dynamic>> rbacListRoles() {
    return _dio.request('/roles', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> rbacCreateRole(CreateRoleDto body) {
    return _dio.request('/roles', options: Options(method: 'POST'), data: body.toJson());
  }

  Future<Response<dynamic>> rbacListPermissions() {
    return _dio.request('/permissions', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> rbacUpdateRolePermissions(String id, UpdateRolePermissionsDto body) {
    return _dio.request('/roles/${id}/permissions', options: Options(method: 'PUT'), data: body.toJson());
  }

  Future<Response<dynamic>> rbacListUserRoles() {
    return _dio.request('/user-roles', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> rbacAssignUserRole(AssignUserRoleDto body) {
    return _dio.request('/user-roles', options: Options(method: 'POST'), data: body.toJson());
  }

  Future<Response<dynamic>> rbacListUsers() {
    return _dio.request('/users/directory', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> rbacRevokeAssignment(String id) {
    return _dio.request('/user-roles/${id}', options: Options(method: 'DELETE'));
  }

  Future<Response<dynamic>> rbacListApprovals() {
    return _dio.request('/approvals', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> rbacDecideApproval(String id, DecideApprovalDto body) {
    return _dio.request('/approvals/${id}/decide', options: Options(method: 'POST'), data: body.toJson());
  }

  Future<Response<dynamic>> adminGetInstitution() {
    return _dio.request('/institutions/current', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> adminUpdateInstitution(UpdateInstitutionDto body) {
    return _dio.request('/institutions/current', options: Options(method: 'PATCH'), data: body.toJson());
  }

  Future<Response<dynamic>> adminListCampuses() {
    return _dio.request('/campuses', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> adminCreateCampus(CreateCampusDto body) {
    return _dio.request('/campuses', options: Options(method: 'POST'), data: body.toJson());
  }

  Future<Response<dynamic>> adminListFlags() {
    return _dio.request('/feature-flags', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> adminToggleFlag(String key, ToggleFeatureFlagDto body) {
    return _dio.request('/feature-flags/${key}', options: Options(method: 'PATCH'), data: body.toJson());
  }

  Future<Response<dynamic>> adminGetSystemHealth() {
    return _dio.request('/system/health', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> adminGetDashboardSummary() {
    return _dio.request('/dashboard/summary', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> healthLive() {
    return _dio.request('/health', options: Options(method: 'GET'));
  }

  Future<Response<dynamic>> healthReady() {
    return _dio.request('/health/ready', options: Options(method: 'GET'));
  }
}
