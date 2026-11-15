import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class TuitionPaymentScreen extends StatefulWidget {
  final String studentName;
  final String studentNumber;
  final String program;
  final double totalBilled;
  final double scholarshipDeduction;
  final double netPayable;
  final double paidAmount;

  const TuitionPaymentScreen({
    super.key,
    this.studentName = 'Rafiq Hasan',
    this.studentNumber = '2024-CSE-0042',
    this.program = 'B.Sc. in Computer Science & Eng.',
    this.totalBilled = 4050.0,
    this.scholarshipDeduction = 980.0,
    this.netPayable = 3070.0,
    this.paidAmount = 1023.34,
  });

  @override
  State<TuitionPaymentScreen> createState() => _TuitionPaymentScreenState();
}

class _TuitionPaymentScreenState extends State<TuitionPaymentScreen> {
  late double _currentPaid;
  late List<Map<String, dynamic>> _installments;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _currentPaid = widget.paidAmount;
    _installments = [
      {
        'number': 1,
        'amount': 1023.34,
        'dueDate': 'Sep 04, 2026',
        'status': 'PAID',
        'paidAt': 'Sep 04, 2026 • 02:32 PM',
        'txRef': 'TXN-STRIPE-89102',
      },
      {
        'number': 2,
        'amount': 1023.33,
        'dueDate': 'Nov 15, 2026',
        'status': 'DUE',
      },
      {
        'number': 3,
        'amount': 1023.33,
        'dueDate': 'Jan 15, 2027',
        'status': 'UPCOMING',
      },
    ];
  }

  void _handlePayNextInstallment() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return Container(
          padding: const EdgeInsets.all(AppSpacing.s24),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCard : AppColors.lightCard,
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(AppRadius.r3xl),
            ),
          ),
          child: SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Pay Installment #2',
                      style: AppTextStyles.title2.copyWith(
                        color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    IconButton(
                      icon: Icon(
                        PhosphorIcons.x(),
                        color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                      ),
                      onPressed: () => Navigator.of(ctx).pop(),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.s12),
                Text(
                  'Amount Due: \$1,023.33 USD',
                  style: AppTextStyles.heading4.copyWith(
                    color: AppColors.teal,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: AppSpacing.s8),
                Text(
                  'Secured by Stripe payment gateway. Zero transaction surcharge for university debit cards.',
                  style: AppTextStyles.caption1.copyWith(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                ),
                const SizedBox(height: AppSpacing.s20),
                Container(
                  padding: const EdgeInsets.all(AppSpacing.s16),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkElevated : AppColors.lightElevated,
                    borderRadius: BorderRadius.circular(AppRadius.xl),
                    border: Border.all(
                      color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(PhosphorIcons.creditCard(), color: AppColors.teal),
                      const SizedBox(width: AppSpacing.s12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Standard Chartered •••• 4242',
                              style: AppTextStyles.body4.copyWith(
                                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              'Expires 08/28',
                              style: AppTextStyles.caption2.copyWith(
                                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        PhosphorIcons.checkCircle(),
                        color: AppColors.teal,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.s24),
                AppButton(
                  label: _isProcessing ? 'Processing Payment...' : 'Confirm \$1,023.33 Payment',
                  onPressed: _isProcessing
                      ? null
                      : () {
                          Navigator.of(ctx).pop();
                          _executePayment();
                        },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _executePayment() {
    setState(() => _isProcessing = true);
    Future.delayed(const Duration(milliseconds: 700), () {
      if (!mounted) return;
      setState(() {
        _isProcessing = false;
        _currentPaid += 1023.33;
        _installments[1]['status'] = 'PAID';
        _installments[1]['paidAt'] = 'Today • Just now';
        _installments[1]['txRef'] = 'TXN-STRIPE-92014';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Payment of \$1,023.33 successful! Receipt generated.',
            style: AppTextStyles.body5.copyWith(color: AppColors.white),
          ),
          backgroundColor: AppColors.tealDeep,
          behavior: SnackBarBehavior.floating,
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final balanceRemaining = (widget.netPayable - _currentPaid).clamp(0.0, widget.netPayable);

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkCanvas : AppColors.lightCanvas,
      appBar: AppBar(
        title: Text(
          'Tuition & Fees',
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
            // Outstanding Hero Summary Card
            Container(
              padding: const EdgeInsets.all(AppSpacing.s20),
              decoration: BoxDecoration(
                color: AppColors.ink,
                borderRadius: BorderRadius.circular(AppRadius.r3xl),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            PhosphorIcons.receipt(),
                            color: AppColors.teal,
                            size: 20,
                          ),
                          const SizedBox(width: AppSpacing.s8),
                          Text(
                            'Fall 2026 Tuition',
                            style: AppTextStyles.caption1.copyWith(
                              color: AppColors.white70,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      AppChip(
                        label: balanceRemaining > 0 ? 'Balance Due' : 'Paid in Full',
                        tone: balanceRemaining > 0 ? ChipTone.warning : ChipTone.success,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s16),
                  Text(
                    '\$${balanceRemaining.toStringAsFixed(2)}',
                    style: AppTextStyles.heading2.copyWith(
                      color: AppColors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  Text(
                    'Net Total: \$${widget.netPayable.toStringAsFixed(2)} (Waiver -\$${widget.scholarshipDeduction.toStringAsFixed(2)})',
                    style: AppTextStyles.caption2.copyWith(
                      color: AppColors.white70,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s16),
                  if (balanceRemaining > 0)
                    AppButton(
                      label: 'Pay Next Installment (\$1,023.33)',
                      onPressed: _handlePayNextInstallment,
                    ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.s24),

            // 3-Tier Installment Schedule
            Text(
              'Installment Schedule',
              style: AppTextStyles.title3.copyWith(
                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppSpacing.s8),
            Text(
              'Three-tier semester installment breakdown',
              style: AppTextStyles.caption2.copyWith(
                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
              ),
            ),
            const SizedBox(height: AppSpacing.s12),

            ..._installments.map((inst) {
              final isPaid = inst['status'] == 'PAID';
              final isDue = inst['status'] == 'DUE';
              return Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.s12),
                child: AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 28,
                                height: 28,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: isPaid
                                      ? (isDark ? AppColors.darkSuccessBg : AppColors.lightSuccessBg)
                                      : (isDark ? AppColors.darkElevated : AppColors.lightElevated),
                                  shape: BoxShape.circle,
                                ),
                                child: Text(
                                  '${inst['number']}',
                                  style: AppTextStyles.caption1.copyWith(
                                    color: isPaid
                                        ? (isDark ? AppColors.darkSuccessText : AppColors.lightSuccessText)
                                        : (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              const SizedBox(width: AppSpacing.s12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Installment #${inst['number']}',
                                    style: AppTextStyles.body4.copyWith(
                                      color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  Text(
                                    'Due: ${inst['dueDate']}',
                                    style: AppTextStyles.caption2.copyWith(
                                      color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '\$${(inst['amount'] as double).toStringAsFixed(2)}',
                                style: AppTextStyles.body3.copyWith(
                                  color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: AppSpacing.s4),
                              AppChip(
                                label: inst['status'] as String,
                                tone: isPaid
                                    ? ChipTone.success
                                    : isDue
                                        ? ChipTone.warning
                                        : ChipTone.neutral,
                              ),
                            ],
                          ),
                        ],
                      ),
                      if (isPaid && inst['txRef'] != null) ...[
                        const SizedBox(height: AppSpacing.s8),
                        Divider(
                          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                          height: 1,
                        ),
                        const SizedBox(height: AppSpacing.s8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Stripe: ${inst['txRef']}',
                              style: AppTextStyles.caption2.copyWith(
                                color: isDark ? AppColors.darkSuccessText : AppColors.lightSuccessText,
                              ),
                            ),
                            Text(
                              inst['paidAt'] as String,
                              style: AppTextStyles.caption2.copyWith(
                                color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              );
            }),

            const SizedBox(height: AppSpacing.s16),

            // Itemized Tuition Breakdown Card
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Fee Breakdown',
                        style: AppTextStyles.title3.copyWith(
                          color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      AppChip(
                        label: '15 Credits',
                        tone: ChipTone.info,
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.s16),
                  _buildLineItem(
                    label: 'Tuition (15 cr @ \$200)',
                    amount: '\$3,000.00',
                    isDark: isDark,
                  ),
                  _buildLineItem(
                    label: 'Lab & Computer Facility',
                    amount: '\$650.00',
                    isDark: isDark,
                  ),
                  _buildLineItem(
                    label: 'Library & Digital Journals',
                    amount: '\$250.00',
                    isDark: isDark,
                  ),
                  _buildLineItem(
                    label: 'Student Activity Fund',
                    amount: '\$150.00',
                    isDark: isDark,
                  ),
                  Divider(
                    color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  ),
                  _buildLineItem(
                    label: 'Gross Tuition Total',
                    amount: '\$4,050.00',
                    isDark: isDark,
                    isBold: true,
                  ),
                  _buildLineItem(
                    label: "Dean's Merit Waiver (25%)",
                    amount: '-\$980.00',
                    isDark: isDark,
                    isDiscount: true,
                  ),
                  Divider(
                    color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  ),
                  _buildLineItem(
                    label: 'Net Payable',
                    amount: '\$3,070.00',
                    isDark: isDark,
                    isBold: true,
                    highlight: true,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLineItem({
    required String label,
    required String amount,
    required bool isDark,
    bool isBold = false,
    bool isDiscount = false,
    bool highlight = false,
  }) {
    Color textColor = isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary;
    if (isDiscount) {
      textColor = isDark ? AppColors.darkSuccessText : AppColors.lightSuccessText;
    } else if (highlight) {
      textColor = AppColors.teal;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.s4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: AppTextStyles.body5.copyWith(
              color: isDiscount
                  ? textColor
                  : isDark
                      ? AppColors.darkTextSecondary
                      : AppColors.lightTextSecondary,
              fontWeight: isBold ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
          Text(
            amount,
            style: AppTextStyles.body5.copyWith(
              color: textColor,
              fontWeight: isBold ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}
