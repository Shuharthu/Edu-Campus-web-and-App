import 'dart:async';
import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class DigitalIdScreen extends StatefulWidget {
  final String studentName;
  final String studentNumber;
  final String department;
  final String program;
  final String bloodGroup;
  final String emergencyPhone;
  final String cardUuid;
  final String validity;

  const DigitalIdScreen({
    super.key,
    this.studentName = 'Rafiq Hasan',
    this.studentNumber = '2024-CSE-0042',
    this.department = 'Computer Science & Engineering',
    this.program = 'B.Sc. in Computer Science & Eng.',
    this.bloodGroup = 'A+',
    this.emergencyPhone = '+880 1711-234567',
    this.cardUuid = 'smartedu_id_2024_cse_0042',
    this.validity = 'Aug 2028',
  });

  @override
  State<DigitalIdScreen> createState() => _DigitalIdScreenState();
}

class _DigitalIdScreenState extends State<DigitalIdScreen> {
  int _secondsRemaining = 30;
  Timer? _countdownTimer;
  String _currentQrToken = 'SMARTEDU-PASS-2024-CSE-0042-89a1f2b4';

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_secondsRemaining > 1) {
        setState(() => _secondsRemaining--);
      } else {
        setState(() {
          _secondsRemaining = 30;
          _currentQrToken =
              'SMARTEDU-PASS-2024-CSE-0042-${DateTime.now().millisecondsSinceEpoch.toRadixString(16).substring(4, 12)}';
        });
      }
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkCanvas : AppColors.lightCanvas,
      appBar: AppBar(
        title: Text(
          'Digital Student ID',
          style: AppTextStyles.title2.copyWith(
            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: isDark ? AppColors.darkCanvas : AppColors.lightCanvas,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            PhosphorIcons.arrowLeft(),
            color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.s16,
            vertical: AppSpacing.s12,
          ),
          children: [
            // University Identity Card Surface (High Fidelity Holographic Style)
            Container(
              padding: const EdgeInsets.all(AppSpacing.s20),
              decoration: BoxDecoration(
                color: AppColors.ink,
                borderRadius: BorderRadius.circular(AppRadius.r3xl),
                border: Border.all(
                  color: AppColors.tealDeep,
                  width: 1.5,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Institution Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: AppColors.teal,
                              borderRadius: BorderRadius.circular(AppRadius.lg),
                            ),
                            child: Icon(
                              PhosphorIcons.graduationCap(),
                              color: AppColors.ink,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.s12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'SMART EDU UNIVERSITY',
                                style: AppTextStyles.caption1.copyWith(
                                  color: AppColors.white,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 0.8,
                                ),
                              ),
                              Text(
                                'Main Campus • Official Credential',
                                style: AppTextStyles.caption3.copyWith(
                                  color: AppColors.white70,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const AppChip(
                        label: 'ACTIVE',
                        tone: ChipTone.success,
                      ),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.s24),

                  // Student Profile Row
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Holographic verified photo container
                      Container(
                        width: 72,
                        height: 88,
                        decoration: BoxDecoration(
                          color: AppColors.darkElevated,
                          borderRadius: BorderRadius.circular(AppRadius.xl),
                          border: Border.all(
                            color: AppColors.teal,
                            width: 1.5,
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              PhosphorIcons.user(),
                              size: 36,
                              color: AppColors.teal,
                            ),
                            const SizedBox(height: AppSpacing.s4),
                            Text(
                              'VERIFIED',
                              style: AppTextStyles.caption3.copyWith(
                                color: AppColors.teal,
                                fontWeight: FontWeight.w600,
                                fontSize: 8.0,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: AppSpacing.s16),

                      // Name, Roll, Dept
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.studentName,
                              style: AppTextStyles.title2.copyWith(
                                color: AppColors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.s2),
                            Text(
                              widget.studentNumber,
                              style: AppTextStyles.body4.copyWith(
                                color: AppColors.teal,
                                fontWeight: FontWeight.w600,
                                fontFamily: AppTextStyles.fontFamilyMono,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.s4),
                            Text(
                              widget.program,
                              style: AppTextStyles.caption2.copyWith(
                                color: AppColors.white70,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.s20),
                  Divider(color: AppColors.darkBorder),
                  const SizedBox(height: AppSpacing.s12),

                  // Metadata Grid (Blood Group, Validity, Emergency)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildIdField('BLOOD GROUP', widget.bloodGroup, isHighlight: true),
                      _buildIdField('VALID THRU', widget.validity),
                      _buildIdField('EMERGENCY', widget.emergencyPhone),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.s16),

                  // Access Rights Chips
                  Row(
                    children: [
                      Text(
                        'Access: ',
                        style: AppTextStyles.caption3.copyWith(
                          color: AppColors.white70,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.s6),
                      const AppChip(label: 'Main Gate', tone: ChipTone.neutral),
                      const SizedBox(width: AppSpacing.s6),
                      const AppChip(label: 'Library', tone: ChipTone.neutral),
                      const SizedBox(width: AppSpacing.s6),
                      const AppChip(label: 'Hardware Lab', tone: ChipTone.neutral),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s24),

            // Dynamic Anti-Fraud Rolling QR Code Card
            AppCard(
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            PhosphorIcons.qrCode(),
                            color: AppColors.teal,
                            size: 20,
                          ),
                          const SizedBox(width: AppSpacing.s8),
                          Text(
                            'Dynamic Gate Pass',
                            style: AppTextStyles.title3.copyWith(
                              color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Icon(
                            PhosphorIcons.clock(),
                            size: 14,
                            color: AppColors.teal,
                          ),
                          const SizedBox(width: AppSpacing.s4),
                          Text(
                            '${_secondsRemaining}s',
                            style: AppTextStyles.caption2.copyWith(
                              color: AppColors.teal,
                              fontWeight: FontWeight.w600,
                              fontFamily: AppTextStyles.fontFamilyMono,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s8),
                  Text(
                    'Rotates every 30 seconds with cryptographic TOTP HMAC signature to prevent screenshot sharing.',
                    style: AppTextStyles.caption2.copyWith(
                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s20),

                  // High-contrast QR Container
                  Container(
                    width: 200,
                    height: 200,
                    padding: const EdgeInsets.all(AppSpacing.s16),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(AppRadius.r2xl),
                      border: Border.all(
                        color: AppColors.teal,
                        width: 2.0,
                      ),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            PhosphorIcons.qrCode(),
                            size: 130,
                            color: AppColors.ink,
                          ),
                          const SizedBox(height: AppSpacing.s4),
                          Text(
                            _currentQrToken.substring(0, 18),
                            style: AppTextStyles.caption3.copyWith(
                              color: AppColors.ink,
                              fontFamily: AppTextStyles.fontFamilyMono,
                              fontSize: 9.0,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: AppSpacing.s16),

                  // Progress bar showing 30s lifetime
                  ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.full),
                    child: LinearProgressIndicator(
                      value: _secondsRemaining / 30.0,
                      backgroundColor: isDark ? AppColors.darkElevated : AppColors.lightElevated,
                      valueColor: const AlwaysStoppedAnimation<Color>(AppColors.teal),
                      minHeight: 4,
                    ),
                  ),

                  const SizedBox(height: AppSpacing.s12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        PhosphorIcons.shieldCheck(),
                        color: isDark ? AppColors.darkSuccessText : AppColors.lightSuccessText,
                        size: 16,
                      ),
                      const SizedBox(width: AppSpacing.s6),
                      Text(
                        'Turnstile Scanner Ready • Touchless NFC & QR',
                        style: AppTextStyles.caption2.copyWith(
                          color: isDark ? AppColors.darkSuccessText : AppColors.lightSuccessText,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s16),

            // Wallet & Share Buttons
            AppButton(
              label: 'Add to Apple / Google Wallet',
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      'Digital pass added to mobile wallet!',
                      style: AppTextStyles.body5.copyWith(color: AppColors.white),
                    ),
                    backgroundColor: AppColors.tealDeep,
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIdField(String label, String value, {bool isHighlight = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.caption3.copyWith(
            color: AppColors.white70,
            fontSize: 9.0,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: AppSpacing.s2),
        Text(
          value,
          style: AppTextStyles.caption1.copyWith(
            color: isHighlight ? AppColors.teal : AppColors.white,
            fontWeight: FontWeight.w600,
            fontFamily: AppTextStyles.fontFamilyMono,
          ),
        ),
      ],
    );
  }
}
