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
enum SignUpRoleOption { student, faculty }

class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  bool _isSignUpMode = false;

  // Sign In controllers
  MobileRoleOption _selectedRole = MobileRoleOption.admin;
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  // Sign Up controllers
  final _nameController = TextEditingController();
  final _signUpEmailController = TextEditingController();
  final _signUpPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  SignUpRoleOption _signUpRole = SignUpRoleOption.student;
  String _selectedDepartment = 'CSE';
  bool _obscureSignUpPassword = true;
  bool _obscureConfirmPassword = true;

  final List<String> _departments = ['CSE', 'EEE', 'BBA', 'Architecture'];

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _signUpEmailController.dispose();
    _signUpPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _onRoleSelected(MobileRoleOption role) {
    setState(() {
      _selectedRole = role;
    });
  }

  Future<void> _submitSignIn() async {
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

  Future<void> _submitSignUp() async {
    final name = _nameController.text.trim();
    final email = _signUpEmailController.text.trim();
    final password = _signUpPasswordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please fill out all registration fields.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    if (password.length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Password must be at least 8 characters long.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    if (password != confirmPassword) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Passwords do not match.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    final roleSlug = _signUpRole == SignUpRoleOption.student ? 'student' : 'faculty';

    final result = await ref.read(authProvider.notifier).register(
      fullName: name,
      email: email,
      password: password,
      roleSlug: roleSlug,
      departmentCode: _selectedDepartment,
    );

    if (mounted) {
      if (result['success'] == true) {
        showDialog<void>(
          context: context,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadii.r16),
            ),
            title: Row(
              children: [
                const Icon(PhosphorIconsBold.checkCircle, color: AppColors.teal, size: 24),
                const SizedBox(width: AppSpacing.s8),
                Text('Registration Submitted', style: AppTextStyles.title3),
              ],
            ),
            content: Text(
              'Your registration request has been submitted successfully.\n\nAn administrator will review and accept your account at the Approvals Desk before you can sign in.',
              style: AppTextStyles.body5,
            ),
            actions: [
              AppButton(
                label: 'Continue to Sign In',
                variant: AppButtonVariant.primary,
                size: AppButtonSize.small,
                onPressed: () {
                  Navigator.of(ctx).pop();
                  setState(() {
                    _isSignUpMode = false;
                    _emailController.text = email;
                    _selectedRole = _signUpRole == SignUpRoleOption.student
                        ? MobileRoleOption.student
                        : MobileRoleOption.faculty;
                  });
                },
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message']?.toString() ?? 'Registration failed.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
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

              // Mode Tabs: [ Sign In ] vs [ Create Account ]
              Container(
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkElevated : AppColors.lightElevated,
                  borderRadius: BorderRadius.circular(AppRadius.r8),
                  border: Border.all(
                    color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  ),
                ),
                padding: const EdgeInsets.all(AppSpacing.s4),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isSignUpMode = false),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: AppSpacing.s8),
                          decoration: BoxDecoration(
                            color: !_isSignUpMode
                                ? (isDark ? AppColors.darkCard : AppColors.white)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(AppRadius.r6),
                            boxShadow: !_isSignUpMode
                                ? [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.05),
                                      blurRadius: 4,
                                      offset: const Offset(0, 2),
                                    )
                                  ]
                                : null,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            'Sign In',
                            style: AppTextStyles.body3.copyWith(
                              fontWeight: !_isSignUpMode ? FontWeight.w600 : FontWeight.w400,
                              color: !_isSignUpMode
                                  ? AppColors.teal
                                  : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _isSignUpMode = true),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: AppSpacing.s8),
                          decoration: BoxDecoration(
                            color: _isSignUpMode
                                ? (isDark ? AppColors.darkCard : AppColors.white)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(AppRadius.r6),
                            boxShadow: _isSignUpMode
                                ? [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.05),
                                      blurRadius: 4,
                                      offset: const Offset(0, 2),
                                    )
                                  ]
                                : null,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            'Create Account',
                            style: AppTextStyles.body3.copyWith(
                              fontWeight: _isSignUpMode ? FontWeight.w600 : FontWeight.w400,
                              color: _isSignUpMode
                                  ? AppColors.teal
                                  : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.s20),

              if (!_isSignUpMode) ...[
                Text('Sign in to Smart EDU', style: AppTextStyles.heading4),
                const SizedBox(height: AppSpacing.s8),
                Text(
                  'Use your university email to access classes, timetable and portal.',
                  style: AppTextStyles.body6,
                ),
                const SizedBox(height: AppSpacing.s20),
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
                        onPressed: authState.isLoading ? null : _submitSignIn,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.s16),
                Center(
                  child: TextButton(
                    onPressed: () => setState(() => _isSignUpMode = true),
                    child: Text(
                      "Don't have an approved account? Create account →",
                      style: AppTextStyles.body6.copyWith(color: AppColors.teal),
                    ),
                  ),
                ),
              ] else ...[
                Text('Create Student or Faculty Account', style: AppTextStyles.heading4),
                const SizedBox(height: AppSpacing.s8),
                Text(
                  'Register your account. An administrator will review and accept your registration.',
                  style: AppTextStyles.body6,
                ),
                const SizedBox(height: AppSpacing.s20),
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AppInput(
                        label: 'Full Name',
                        controller: _nameController,
                        placeholder: 'e.g. Tariq Ahmed',
                      ),
                      const SizedBox(height: AppSpacing.s14),
                      AppInput(
                        label: 'University Email',
                        controller: _signUpEmailController,
                        placeholder: 'e.g. name@university.edu',
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: AppSpacing.s14),

                      Text(
                        'Role',
                        style: AppTextStyles.caption5.copyWith(
                          color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s6),
                      Row(
                        children: [
                          Expanded(
                            child: _buildSignUpRoleChip('Student', SignUpRoleOption.student, isDark),
                          ),
                          const SizedBox(width: AppSpacing.s8),
                          Expanded(
                            child: _buildSignUpRoleChip('Faculty Member', SignUpRoleOption.faculty, isDark),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.s14),

                      Text(
                        'Department',
                        style: AppTextStyles.caption5.copyWith(
                          color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s12),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkElevated : AppColors.lightElevated,
                          borderRadius: BorderRadius.circular(AppRadius.r8),
                          border: Border.all(
                            color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                          ),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _selectedDepartment,
                            isExpanded: true,
                            dropdownColor: isDark ? AppColors.darkCard : AppColors.white,
                            items: _departments.map((dept) {
                              return DropdownMenuItem(
                                value: dept,
                                child: Text(dept, style: AppTextStyles.body5),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) setState(() => _selectedDepartment = val);
                            },
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s14),

                      AppInput(
                        label: 'Password',
                        controller: _signUpPasswordController,
                        placeholder: 'Create password (min 8 chars)',
                        obscureText: _obscureSignUpPassword,
                        suffixIcon: IconButton(
                          onPressed: () => setState(() => _obscureSignUpPassword = !_obscureSignUpPassword),
                          icon: Icon(
                            _obscureSignUpPassword
                                ? PhosphorIconsRegular.eye
                                : PhosphorIconsRegular.eyeSlash,
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s14),

                      AppInput(
                        label: 'Confirm Password',
                        controller: _confirmPasswordController,
                        placeholder: 'Repeat your password',
                        obscureText: _obscureConfirmPassword,
                        suffixIcon: IconButton(
                          onPressed: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
                          icon: Icon(
                            _obscureConfirmPassword
                                ? PhosphorIconsRegular.eye
                                : PhosphorIconsRegular.eyeSlash,
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s20),

                      AppButton(
                        label: authState.isLoading
                            ? 'Submitting registration...'
                            : 'Submit for Administrator Approval',
                        fullWidth: true,
                        onPressed: authState.isLoading ? null : _submitSignUp,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.s16),
                Center(
                  child: TextButton(
                    onPressed: () => setState(() => _isSignUpMode = false),
                    child: Text(
                      'Already have an account? Sign in instead →',
                      style: AppTextStyles.body6.copyWith(color: AppColors.teal),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: AppSpacing.s12),
              Text(
                'Multi-tenant database authentication enabled. Pending accounts require administrator acceptance before signing in.',
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

  Widget _buildSignUpRoleChip(String label, SignUpRoleOption role, bool isDark) {
    final isSelected = _signUpRole == role;
    return GestureDetector(
      onTap: () => setState(() => _signUpRole = role),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.s8, horizontal: AppSpacing.s8),
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
            Text(
              label,
              style: AppTextStyles.caption4.copyWith(
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected
                    ? AppColors.brandTeal
                    : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
              ),
            ),
            const SizedBox(width: 6),
            if (isSelected)
              const Icon(
                PhosphorIconsBold.check,
                size: 14,
                color: AppColors.brandTeal,
              ),
          ],
        ),
      ),
    );
  }
}
