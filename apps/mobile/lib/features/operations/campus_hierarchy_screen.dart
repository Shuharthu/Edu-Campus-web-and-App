import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';
import '../../shared/widgets/app_input.dart';
import '../auth/auth_provider.dart';

class CampusHierarchyScreen extends ConsumerStatefulWidget {
  const CampusHierarchyScreen({super.key});

  @override
  ConsumerState<CampusHierarchyScreen> createState() => _CampusHierarchyScreenState();
}

class _CampusHierarchyScreenState extends ConsumerState<CampusHierarchyScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<Map<String, dynamic>> _campuses = [];

  @override
  void initState() {
    super.initState();
    _fetchCampuses();
  }

  Future<void> _fetchCampuses() async {
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

      final response = await dio.get('/operations/campuses');
      if (response.data is List) {
        final list = (response.data as List).map((item) {
          final map = item as Map<String, dynamic>;
          final stats = map['stats'] as Map<String, dynamic>? ?? {};
          return {
            'id': map['id']?.toString() ?? '',
            'name': map['name']?.toString() ?? 'Campus',
            'code': map['code']?.toString() ?? 'CAMP',
            'address': map['address']?.toString() ?? 'Academic Precinct',
            'timezone': map['timezone']?.toString() ?? 'UTC',
            'status': map['status']?.toString() ?? 'ACTIVE',
            'departments': stats['departmentsCount'] ?? 0,
            'programs': stats['programsCount'] ?? 0,
            'rooms': stats['roomsCount'] ?? 0,
            'students': stats['studentsCount'] ?? 0,
            'staff': stats['staffCount'] ?? 0,
          };
        }).toList();

        setState(() {
          _campuses = list;
          _isLoading = false;
        });
      } else {
        setState(() {
          _campuses = [];
          _isLoading = false;
        });
      }
    } on DioException catch (e) {
      String msg = 'Failed to load campus infrastructure.';
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

  void _showAddCampusSheet() {
    final nameCtrl = TextEditingController();
    final codeCtrl = TextEditingController();
    final addressCtrl = TextEditingController();
    final timezoneCtrl = TextEditingController(text: 'UTC');

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.r2xl)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + AppSpacing.s24,
            left: AppSpacing.s24,
            right: AppSpacing.s24,
            top: AppSpacing.s24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Add New Campus',
                    style: AppTextStyles.title2.copyWith(fontWeight: FontWeight.w600),
                  ),
                  IconButton(
                    icon: Icon(PhosphorIcons.x()),
                    onPressed: () => Navigator.of(ctx).pop(),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.s16),
              AppInput(
                controller: nameCtrl,
                label: 'Campus Name',
                hintText: 'e.g. West Engineering Campus',
              ),
              const SizedBox(height: AppSpacing.s12),
              AppInput(
                controller: codeCtrl,
                label: 'Campus Code',
                hintText: 'e.g. WEST',
              ),
              const SizedBox(height: AppSpacing.s12),
              AppInput(
                controller: addressCtrl,
                label: 'Physical Address',
                hintText: 'e.g. 500 Technology Blvd',
              ),
              const SizedBox(height: AppSpacing.s12),
              AppInput(
                controller: timezoneCtrl,
                label: 'Operating Timezone',
                hintText: 'e.g. UTC, America/New_York',
              ),
              const SizedBox(height: AppSpacing.s20),
              AppButton(
                label: 'Create Campus Branch',
                variant: AppButtonVariant.primary,
                size: AppButtonSize.medium,
                fullWidth: true,
                onPressed: () async {
                  if (nameCtrl.text.isEmpty || codeCtrl.text.isEmpty) {
                    return;
                  }
                  Navigator.of(ctx).pop();

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

                    await dio.post('/operations/campuses', data: {
                      'name': nameCtrl.text.trim(),
                      'code': codeCtrl.text.trim().toUpperCase(),
                      'address': addressCtrl.text.trim(),
                      'timezone': timezoneCtrl.text.trim(),
                    });

                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Campus created and synchronized to PostgreSQL.'),
                          backgroundColor: AppColors.tealDeep,
                        ),
                      );
                      _fetchCampuses();
                    }
                  } catch (e) {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Failed to create campus: $e'),
                          backgroundColor: Colors.redAccent,
                        ),
                      );
                    }
                  }
                },
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    int totalStudents = 0;
    int totalRooms = 0;
    int totalDepts = 0;
    for (final c in _campuses) {
      totalStudents += (c['students'] as num? ?? 0).toInt();
      totalRooms += (c['rooms'] as num? ?? 0).toInt();
      totalDepts += (c['departments'] as num? ?? 0).toInt();
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Campus Infrastructure',
          style: AppTextStyles.title2.copyWith(fontWeight: FontWeight.w600),
        ),
        actions: [
          IconButton(
            icon: Icon(PhosphorIcons.arrowsClockwise()),
            onPressed: _fetchCampuses,
            tooltip: 'Refresh',
          ),
          IconButton(
            icon: Icon(PhosphorIcons.plus()),
            onPressed: _showAddCampusSheet,
            tooltip: 'Add Campus',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchCampuses,
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.s16),
          children: [
            // Top Stats Banner
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
                          color: AppColors.brightTeal.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(AppRadii.r8),
                        ),
                        child: Icon(
                          PhosphorIcons.buildings(),
                          size: 24,
                          color: AppColors.brightTeal,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.s12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Multi-Campus Network',
                              style: AppTextStyles.title2.copyWith(fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: AppSpacing.s2),
                            Text(
                              'Enterprise institutional hierarchy & physical facilities',
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
                  Row(
                    children: [
                      Expanded(
                        child: _StatBox(
                          label: 'Campuses',
                          value: '${_campuses.length}',
                          isDark: isDark,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.s8),
                      Expanded(
                        child: _StatBox(
                          label: 'Facilities',
                          value: '$totalRooms',
                          isDark: isDark,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.s8),
                      Expanded(
                        child: _StatBox(
                          label: 'Enrolled',
                          value: '$totalStudents',
                          isDark: isDark,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.s16),

            // Loading / Error / Empty / List
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
                      onPressed: _fetchCampuses,
                    ),
                  ],
                ),
              )
            else if (_campuses.isEmpty)
              AppCard(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.s24),
                  child: Column(
                    children: [
                      Icon(PhosphorIcons.buildings(), size: 44, color: AppColors.neutral400),
                      const SizedBox(height: AppSpacing.s12),
                      Text('No Campuses Registered', style: AppTextStyles.title3),
                      const SizedBox(height: AppSpacing.s16),
                      AppButton(
                        label: 'Add First Campus',
                        variant: AppButtonVariant.primary,
                        size: AppButtonSize.small,
                        onPressed: _showAddCampusSheet,
                      ),
                    ],
                  ),
                ),
              )
            else
              ..._campuses.map((c) {
                final name = c['name'] as String;
                final code = c['code'] as String;
                final address = c['address'] as String;
                final timezone = c['timezone'] as String;
                final depts = c['departments'] as int;
                final rooms = c['rooms'] as int;
                final students = c['students'] as int;
                final programs = c['programs'] as int;

                return Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.s12),
                  child: AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.s8,
                                vertical: AppSpacing.s4,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.teal.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(AppRadii.r6),
                              ),
                              child: Text(
                                code,
                                style: AppTextStyles.caption1.copyWith(
                                  color: AppColors.teal,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            const SizedBox(width: AppSpacing.s8),
                            Expanded(
                              child: Text(
                                name,
                                style: AppTextStyles.title3.copyWith(fontWeight: FontWeight.w600),
                              ),
                            ),
                            const AppChip(
                              label: 'Operational',
                              tone: AppChipTone.success,
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.s8),
                        Row(
                          children: [
                            Icon(
                              PhosphorIcons.mapPin(),
                              size: 16,
                              color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                            ),
                            const SizedBox(width: AppSpacing.s4),
                            Expanded(
                              child: Text(
                                address,
                                style: AppTextStyles.caption2.copyWith(
                                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.s4),
                        Row(
                          children: [
                            Icon(
                              PhosphorIcons.clock(),
                              size: 16,
                              color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                            ),
                            const SizedBox(width: AppSpacing.s4),
                            Text(
                              'Timezone: $timezone',
                              style: AppTextStyles.caption2.copyWith(
                                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.s12),
                        const Divider(),
                        const SizedBox(height: AppSpacing.s8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _MetricItem(label: 'Departments', value: '$depts', isDark: isDark),
                            _MetricItem(label: 'Programs', value: '$programs', isDark: isDark),
                            _MetricItem(label: 'Rooms/Labs', value: '$rooms', isDark: isDark),
                            _MetricItem(label: 'Students', value: '$students', isDark: isDark),
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

class _StatBox extends StatelessWidget {
  final String label;
  final String value;
  final bool isDark;

  const _StatBox({
    required this.label,
    required this.value,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.s8, horizontal: AppSpacing.s8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkElevated : AppColors.neutral100,
        borderRadius: BorderRadius.circular(AppRadii.r8),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: AppTextStyles.title2.copyWith(
              color: AppColors.teal,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppSpacing.s2),
          Text(
            label,
            style: AppTextStyles.caption2.copyWith(
              color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricItem extends StatelessWidget {
  final String label;
  final String value;
  final bool isDark;

  const _MetricItem({
    required this.label,
    required this.value,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: AppTextStyles.body3.copyWith(
            fontWeight: FontWeight.w600,
            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
          ),
        ),
        const SizedBox(height: AppSpacing.s2),
        Text(
          label,
          style: AppTextStyles.caption2.copyWith(
            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
          ),
        ),
      ],
    );
  }
}
