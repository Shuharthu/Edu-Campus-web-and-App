import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:local_auth/local_auth.dart';
import '../../core/config/app_flavor.dart';

class RoleAssignmentItem {
  final String id;
  final String roleSlug;
  final String roleName;
  final String roleTier;
  final String scopeType;
  final String? departmentCode;
  final bool isActing;

  const RoleAssignmentItem({
    required this.id,
    required this.roleSlug,
    required this.roleName,
    required this.roleTier,
    required this.scopeType,
    this.departmentCode,
    this.isActing = false,
  });
}

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final String? accessToken;
  final String? mfaChallengeToken;
  final String? fullName;
  final String? email;
  final String? errorMessage;
  final RoleAssignmentItem? activeRole;
  final List<RoleAssignmentItem> assignments;

  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.accessToken,
    this.mfaChallengeToken,
    this.fullName,
    this.email,
    this.errorMessage,
    this.activeRole,
    this.assignments = const [],
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    String? accessToken,
    String? mfaChallengeToken,
    String? fullName,
    String? email,
    String? errorMessage,
    RoleAssignmentItem? activeRole,
    List<RoleAssignmentItem>? assignments,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      accessToken: accessToken ?? this.accessToken,
      mfaChallengeToken: mfaChallengeToken,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      errorMessage: errorMessage,
      activeRole: activeRole ?? this.activeRole,
      assignments: assignments ?? this.assignments,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._flavor, this._storage, this._localAuth) : super(const AuthState());

  final FlavorConfig _flavor;
  final FlutterSecureStorage _storage;
  final LocalAuthentication _localAuth;

  Future<bool> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final dio = Dio(BaseOptions(
        baseUrl: _flavor.apiBaseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {'Content-Type': 'application/json'},
      ));

      final response = await dio.post(
        '/auth/login',
        data: {
          'email': email.trim().toLowerCase(),
          'password': password,
          'platform': 'mobile',
          'deviceName': 'Android Client',
        },
      );

      final data = response.data as Map<String, dynamic>;
      final status = data['status'] as String?;

      if (status == 'AUTHENTICATED') {
        final accessToken = data['accessToken'] as String;
        final refreshToken = data['refreshToken'] as String?;
        final activeRoleData = data['activeRole'] as Map<String, dynamic>?;

        await _storage.write(key: 'access_token', value: accessToken);
        if (refreshToken != null) {
          await _storage.write(key: 'refresh_token', value: refreshToken);
        }

        final roleItem = activeRoleData != null
            ? RoleAssignmentItem(
                id: activeRoleData['assignmentId'] ?? 'a-1',
                roleSlug: activeRoleData['slug'] ?? 'student',
                roleName: activeRoleData['name'] ?? 'Student',
                roleTier: activeRoleData['tier'] ?? 'STUDENT',
                scopeType: activeRoleData['scopeType'] ?? 'own',
              )
            : const RoleAssignmentItem(
                id: 'default',
                roleSlug: 'student',
                roleName: 'Student',
                roleTier: 'STUDENT',
                scopeType: 'own',
              );

        state = state.copyWith(
          isAuthenticated: true,
          isLoading: false,
          accessToken: accessToken,
          email: email.trim(),
          fullName: activeRoleData?['name'] != null ? '${activeRoleData!['name']} Account' : email.split('@').first,
          activeRole: roleItem,
          assignments: [roleItem],
          errorMessage: null,
        );
        return true;
      }

      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Authentication challenge required.',
      );
      return false;
    } on DioException catch (e) {
      String msg = 'Invalid email or password.';
      if (e.response != null && e.response?.data is Map) {
        final resData = e.response!.data as Map;
        msg = resData['message']?.toString() ?? msg;
      } else if (e.type == DioExceptionType.connectionTimeout ||
                 e.type == DioExceptionType.connectionError) {
        msg = 'Unable to connect to server at ${_flavor.apiBaseUrl}. Please check network connection.';
      }
      state = state.copyWith(isLoading: false, errorMessage: msg);
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
      return false;
    }
  }

  Future<Map<String, dynamic>> register({
    required String fullName,
    required String email,
    required String password,
    required String roleSlug,
    required String departmentCode,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final dio = Dio(BaseOptions(
        baseUrl: _flavor.apiBaseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {'Content-Type': 'application/json'},
      ));

      final response = await dio.post(
        '/auth/register',
        data: {
          'fullName': fullName.trim(),
          'email': email.trim().toLowerCase(),
          'password': password,
          'roleSlug': roleSlug,
          'departmentCode': departmentCode,
        },
      );

      final data = response.data as Map<String, dynamic>;
      state = state.copyWith(isLoading: false);
      return {
        'success': true,
        'message': data['message'] ?? 'Registration submitted. Account pending admin approval.',
      };
    } on DioException catch (e) {
      String msg = 'Registration failed.';
      if (e.response != null && e.response?.data is Map) {
        final resData = e.response!.data as Map;
        msg = resData['message']?.toString() ?? msg;
      }
      state = state.copyWith(isLoading: false, errorMessage: msg);
      return {'success': false, 'message': msg};
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<void> setDemoSession({
    required String fullName,
    required String email,
    required String accessToken,
    required String refreshToken,
    required List<RoleAssignmentItem> assignments,
  }) async {
    await _storage.write(key: 'access_token', value: accessToken);
    await _storage.write(key: 'refresh_token', value: refreshToken);
    state = state.copyWith(
      isAuthenticated: true,
      accessToken: accessToken,
      fullName: fullName,
      email: email,
      assignments: assignments,
      activeRole: assignments.isNotEmpty ? assignments.first : null,
      errorMessage: null,
    );
  }

  void switchRole(RoleAssignmentItem nextRole) {
    state = state.copyWith(activeRole: nextRole);
  }

  Future<bool> authenticateWithBiometrics() async {
    final supported = await _localAuth.isDeviceSupported();
    if (!supported) return true;
    return _localAuth.authenticate(
      localizedReason: 'Unlock your Smart EDU workspace',
    );
  }

  Future<void> signOut() async {
    await _storage.deleteAll();
    state = const AuthState();
  }
}

final flavorProvider = Provider<FlavorConfig>((_) => FlavorConfig.dev);
final secureStorageProvider = Provider<FlutterSecureStorage>((_) => const FlutterSecureStorage());
final localAuthProvider = Provider<LocalAuthentication>((_) => LocalAuthentication());
final themeModeProvider = StateProvider<ThemeMode>((_) => ThemeMode.light);
final localeProvider = StateProvider<Locale>((_) => const Locale('en'));

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(flavorProvider),
    ref.watch(secureStorageProvider),
    ref.watch(localAuthProvider),
  );
});
