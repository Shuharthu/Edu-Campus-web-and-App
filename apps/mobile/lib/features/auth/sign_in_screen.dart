import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_input.dart';
import 'auth_provider.dart';

enum MobileRoleOption { faculty, student, admin }

class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  MobileRoleOption _selectedRole = MobileRoleOption.admin;
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onRoleSelected(MobileRoleOption role) {
    setState(() {
      _selectedRole = role;
    });
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your university email and password.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    final success = await ref.read(authProvider.notifier).login(
      email: email,
      password: password,
    );

    if (success && mounted) {
      context.go('/home');
    } else if (mounted) {
      final error = ref.read(authProvider).errorMessage ?? 'Invalid email or password.';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error),
          backgroundColor: Colors.redAccent,
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.s24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: AppSpacing.s16),
              SvgPicture.asset(
                isDark
                    ? 'assets/brand/smart-edu-logo-dark.svg'
                    : 'assets/brand/smart-edu-logo-light.svg',
                height: 38,
              ),
              const SizedBox(height: AppSpacing.s20),
              Text('Sign in to Smart EDU', style: AppTextStyles.heading4),
              const SizedBox(height: AppSpacing.s8),
              Text(
                'Use your university email to access classes, timetable and portal.',
                style: AppTextStyles.body6,
              ),
              const SizedBox(height: AppSpacing.s24),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppInput(
                      label: 'University email',
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: AppSpacing.s16),
                    AppInput(
                      label: 'Password',
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      suffixIcon: IconButton(
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        icon: Icon(
                          _obscurePassword
                              ? PhosphorIconsRegular.eye
                              : PhosphorIconsRegular.eyeSlash,
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.s16),

                    // Role selection with tick marks - directly beneath password
                    Text(
                      'Select portal role:',
                      style: AppTextStyles.caption5.copyWith(
                        color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.s8),
                    Row(
                      children: [
                        _buildRoleChip('Faculty', MobileRoleOption.faculty, isDark),
                        const SizedBox(width: AppSpacing.s8),
                        _buildRoleChip('Student', MobileRoleOption.student, isDark),
                        const SizedBox(width: AppSpacing.s8),
                        _buildRoleChip('Admin', MobileRoleOption.admin, isDark),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.s20),

                    AppButton(
                      label: authState.isLoading
                          ? 'Verifying credentials...'
                          : 'Sign in as ${_selectedRole.name[0].toUpperCase()}${_selectedRole.name.substring(1)}',
                      fullWidth: true,
                      onPressed: authState.isLoading ? null : _submit,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.s16),
              Text(
                'Strict database authentication enabled. Pending registrations require administrator acceptance.',
                style: AppTextStyles.caption5,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRoleChip(String label, MobileRoleOption role, bool isDark) {
    final isSelected = _selectedRole == role;
    return Expanded(
      child: GestureDetector(
        onTap: () => _onRoleSelected(role),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.s8, horizontal: AppSpacing.s6),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.brandTeal.withValues(alpha: 0.15)
                : (isDark ? AppColors.darkElevated : AppColors.lightElevated),
            borderRadius: BorderRadius.circular(AppRadius.r6),
            border: Border.all(
              color: isSelected ? AppColors.brandTeal : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Flexible(
                child: Text(
                  label,
                  style: AppTextStyles.caption4.copyWith(
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    color: isSelected
                        ? AppColors.brandTeal
                        : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 4),
              if (isSelected)
                const Icon(
                  PhosphorIconsBold.check,
                  size: 14,
                  color: AppColors.brandTeal,
                )
              else
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                      width: 1,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
