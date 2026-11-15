import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';
import '../auth/auth_provider.dart';

class UserApprovalsScreen extends ConsumerStatefulWidget {
  const UserApprovalsScreen({super.key});

  @override
  ConsumerState<UserApprovalsScreen> createState() => _UserApprovalsScreenState();
}

class _UserApprovalsScreenState extends ConsumerState<UserApprovalsScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<Map<String, dynamic>> _pendingList = [];

  @override
  void initState() {
    super.initState();
    _fetchPendingRegistrations();
  }

  Future<void> _fetchPendingRegistrations() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final authState = ref.read(authProvider);
    final flavor = ref.read(flavorProvider);

    try {
      final dio = Dio(BaseOptions(
        baseUrl: flavor.apiBaseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Authorization': 'Bearer ${authState.accessToken}',
          'Content-Type': 'application/json',
        },
      ));

      final response = await dio.get('/auth/pending-registrations');
      if (response.data is List) {
        final list = (response.data as List).map((item) {
          final map = item as Map<String, dynamic>;
          final user = map['user'] as Map<String, dynamic>? ?? {};
          return {
            'id': map['id']?.toString() ?? '',
            'fullName': user['fullName']?.toString() ?? 'Applicant',
            'email': user['email']?.toString() ?? '',
            'role': map['roleRequested']?.toString() ?? 'STUDENT',
            'department': map['departmentCode']?.toString() ?? 'CSE',
            'status': map['status']?.toString() ?? 'PENDING',
            'createdAt': map['createdAt']?.toString() ?? '',
          };
        }).toList();

        setState(() {
          _pendingList = list;
          _isLoading = false;
        });
      } else {
        setState(() {
          _pendingList = [];
          _isLoading = false;
        });
      }
    } on DioException catch (e) {
      String msg = 'Failed to load pending registrations.';
      if (e.response != null && e.response?.data is Map) {
        msg = (e.response!.data as Map)['message']?.toString() ?? msg;
      }
      setState(() {
        _errorMessage = msg;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _approve(String id, String name) async {
    final authState = ref.read(authProvider);
    final flavor = ref.read(flavorProvider);

    try {
      final dio = Dio(BaseOptions(
        baseUrl: flavor.apiBaseUrl,
        headers: {
          'Authorization': 'Bearer ${authState.accessToken}',
          'Content-Type': 'application/json',
        },
      ));

      await dio.post('/auth/approve-registration/$id');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Account for $name approved and activated.'),
            backgroundColor: AppColors.tealDeep,
            duration: const Duration(seconds: 3),
          ),
        );
        _fetchPendingRegistrations();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Approval failed: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  Future<void> _reject(String id, String name) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadii.r16),
        ),
        title: Text('Reject Registration?', style: AppTextStyles.title3),
        content: Text(
          'Are you sure you want to reject the registration for $name ($id)?',
          style: AppTextStyles.body5,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          AppButton(
            label: 'Reject',
            variant: AppButtonVariant.secondary,
            size: AppButtonSize.small,
            onPressed: () => Navigator.of(ctx).pop(true),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    final authState = ref.read(authProvider);
    final flavor = ref.read(flavorProvider);

    try {
      final dio = Dio(BaseOptions(
        baseUrl: flavor.apiBaseUrl,
        headers: {
          'Authorization': 'Bearer ${authState.accessToken}',
          'Content-Type': 'application/json',
        },
      ));

      await dio.post('/auth/reject-registration/$id');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Registration for $name rejected.'),
            backgroundColor: AppColors.brandInk,
          ),
        );
        _fetchPendingRegistrations();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Rejection failed: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'User Approvals',
          style: AppTextStyles.title2.copyWith(fontWeight: FontWeight.w600),
        ),
        actions: [
          IconButton(
            icon: Icon(PhosphorIcons.arrowsClockwise()),
            onPressed: _fetchPendingRegistrations,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchPendingRegistrations,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.s16),
          children: [
            // Header Card
            AppCard(
              featuredDark: isDark,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.s8),
                        decoration: BoxDecoration(
                          color: AppColors.teal.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(AppRadii.r8),
                        ),
                        child: Icon(
                          PhosphorIcons.userCheck(),
                          size: 24,
                          color: AppColors.teal,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.s12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Registration Approval Desk',
                              style: AppTextStyles.title2.copyWith(fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: AppSpacing.s2),
                            Text(
                              'Review student & faculty registration requests',
                              style: AppTextStyles.caption2.copyWith(
                                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s16),
                  Wrap(
                    spacing: AppSpacing.s8,
                    runSpacing: AppSpacing.s8,
                    children: [
                      AppChip(
                        label: 'Pending: ${_pendingList.length}',
                        tone: _pendingList.isNotEmpty ? AppChipTone.warning : AppChipTone.success,
                      ),
                      const AppChip(
                        label: 'PostgreSQL Live Sync',
                        tone: AppChipTone.info,
                      ),
                      const AppChip(
                        label: 'Admin Required',
                        tone: AppChipTone.neutral,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.s16),

            // Content Area
            if (_isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(AppSpacing.s32),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (_errorMessage != null)
              AppCard(
                child: Column(
                  children: [
                    Icon(PhosphorIcons.warningCircle(), size: 36, color: AppColors.amber),
                    const SizedBox(height: AppSpacing.s12),
                    Text(_errorMessage!, style: AppTextStyles.body5, textAlign: TextAlign.center),
                    const SizedBox(height: AppSpacing.s12),
                    AppButton(
                      label: 'Retry',
                      variant: AppButtonVariant.secondary,
                      size: AppButtonSize.small,
                      onPressed: _fetchPendingRegistrations,
                    ),
                  ],
                ),
              )
            else if (_pendingList.isEmpty)
              AppCard(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.s24),
                  child: Column(
                    children: [
                      Icon(PhosphorIcons.checkCircle(), size: 44, color: AppColors.teal),
                      const SizedBox(height: AppSpacing.s12),
                      Text('No Pending Registrations', style: AppTextStyles.title3),
                      const SizedBox(height: AppSpacing.s6),
                      Text(
                        'All student and faculty registration requests have been processed.',
                        style: AppTextStyles.body6.copyWith(
                          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppSpacing.s16),
                      AppButton(
                        label: 'Check Again',
                        variant: AppButtonVariant.secondary,
                        size: AppButtonSize.small,
                        onPressed: _fetchPendingRegistrations,
                      ),
                    ],
                  ),
                ),
              )
            else
              ..._pendingList.map((item) {
                final id = item['id'] as String;
                final name = item['fullName'] as String;
                final email = item['email'] as String;
                final role = item['role'] as String;
                final dept = item['department'] as String;
                final isStudent = role.toUpperCase().contains('STUDENT');

                return Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.s12),
                  child: AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            CircleAvatar(
                              radius: 20,
                              backgroundColor: isStudent
                                  ? AppColors.teal.withValues(alpha: 0.15)
                                  : AppColors.amber.withValues(alpha: 0.15),
                              child: Text(
                                name.isNotEmpty ? name[0].toUpperCase() : 'U',
                                style: AppTextStyles.title3.copyWith(
                                  color: isStudent ? AppColors.teal : AppColors.amber,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            const SizedBox(width: AppSpacing.s12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    name,
                                    style: AppTextStyles.title3.copyWith(fontWeight: FontWeight.w600),
                                  ),
                                  const SizedBox(height: AppSpacing.s2),
                                  Text(
                                    email,
                                    style: AppTextStyles.body6.copyWith(
                                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            AppChip(
                              label: role,
                              tone: isStudent ? AppChipTone.info : AppChipTone.warning,
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.s12),
                        Row(
                          children: [
                            Icon(
                              PhosphorIcons.graduationCap(),
                              size: 16,
                              color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                            ),
                            const SizedBox(width: AppSpacing.s4),
                            Text(
                              'Department: $dept',
                              style: AppTextStyles.caption2.copyWith(
                                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                              ),
                            ),
                            const Spacer(),
                            const AppChip(
                              label: 'Pending Approval',
                              tone: AppChipTone.neutral,
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.s16),
                        Row(
                          children: [
                            Expanded(
                              child: AppButton(
                                label: 'Accept Account',
                                variant: AppButtonVariant.primary,
                                size: AppButtonSize.small,
                                onPressed: () => _approve(id, name),
                              ),
                            ),
                            const SizedBox(width: AppSpacing.s8),
                            Expanded(
                              child: AppButton(
                                label: 'Reject',
                                variant: AppButtonVariant.secondary,
                                size: AppButtonSize.small,
                                onPressed: () => _reject(id, name),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}
