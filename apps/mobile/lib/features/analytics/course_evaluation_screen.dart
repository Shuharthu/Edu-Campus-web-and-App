import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class CourseEvaluationScreen extends StatefulWidget {
  const CourseEvaluationScreen({super.key});

  @override
  State<CourseEvaluationScreen> createState() => _CourseEvaluationScreenState();
}

class _CourseEvaluationScreenState extends State<CourseEvaluationScreen> {
  final TextEditingController _feedbackController = TextEditingController();

  int _clarityRating = 5;
  int _engagementRating = 4;
  int _fairnessRating = 5;
  int _overallRating = 5;
  bool _isAnonymous = true;
  bool _submitted = false;

  @override
  void dispose() {
    _feedbackController.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    setState(() {
      _submitted = true;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Anonymous course evaluation submitted successfully!',
          style: AppTextStyles.caption4.copyWith(color: AppColors.white),
        ),
        backgroundColor: AppColors.darkSuccessText,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Widget _buildStarSelector({
    required String label,
    required String description,
    required int rating,
    required ValueChanged<int> onRatingChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                label,
                style: AppTextStyles.body2.copyWith(
                  color: AppColors.darkTextPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.s8,
                vertical: AppSpacing.s2,
              ),
              decoration: BoxDecoration(
                color: AppColors.darkElevated,
                borderRadius: BorderRadius.circular(AppRadius.sm),
                border: Border.all(color: AppColors.darkBorder),
              ),
              child: Text(
                '$rating / 5',
                style: AppTextStyles.caption5.copyWith(
                  color: AppColors.brightTeal,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.s2),
        Text(
          description,
          style: AppTextStyles.caption5.copyWith(
            color: AppColors.darkTextMuted,
          ),
        ),
        const SizedBox(height: AppSpacing.s8),
        Row(
          children: List.generate(5, (index) {
            final starIndex = index + 1;
            final isFilled = starIndex <= rating;
            return GestureDetector(
              onTap: () => onRatingChanged(starIndex),
              child: Padding(
                padding: const EdgeInsets.only(right: AppSpacing.s12),
                child: Icon(
                  isFilled ? PhosphorIconsFill.star : PhosphorIconsRegular.star,
                  size: AppSpacing.s24,
                  color: isFilled ? AppColors.amber : AppColors.darkTextMuted,
                ),
              ),
            );
          }),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkCanvas,
      appBar: AppBar(
        backgroundColor: AppColors.darkCanvas,
        elevation: 0,
        title: Text(
          'Course Evaluation',
          style: AppTextStyles.title1.copyWith(
            color: AppColors.darkTextPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.s16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Course Banner Card
            AppCard(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.s16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.s8,
                            vertical: AppSpacing.s4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.darkElevated,
                            borderRadius: BorderRadius.circular(AppRadius.xs),
                            border: Border.all(color: AppColors.darkBorder),
                          ),
                          child: Text(
                            'CSE204 • Section 02',
                            style: AppTextStyles.caption4.copyWith(
                              color: AppColors.brightTeal,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.s8,
                            vertical: AppSpacing.s4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.darkInfoBg,
                            borderRadius: BorderRadius.circular(AppRadius.full),
                            border: Border.all(color: AppColors.darkInfoText),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                PhosphorIconsRegular.lock,
                                size: AppSpacing.s12,
                                color: AppColors.darkInfoText,
                              ),
                              const SizedBox(width: AppSpacing.s4),
                              Text(
                                'Anonymous',
                                style: AppTextStyles.caption5.copyWith(
                                  color: AppColors.darkInfoText,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.s12),
                    Text(
                      'Algorithms & Data Structures',
                      style: AppTextStyles.heading6.copyWith(
                        color: AppColors.darkTextPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.s4),
                    Text(
                      'Lead Instructor: Prof. Nusrat Jahan • Department of CSE',
                      style: AppTextStyles.caption4.copyWith(
                        color: AppColors.darkTextSecondary,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.s12),
                    Text(
                      'Your candid feedback is aggregated and anonymized to enhance academic pedagogy and curriculum standards.',
                      style: AppTextStyles.caption5.copyWith(
                        color: AppColors.darkTextMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: AppSpacing.s20),

            if (_submitted) ...[
              AppCard(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.s24),
                  child: Column(
                    children: [
                      Container(
                        height: AppSpacing.s48,
                        width: AppSpacing.s48,
                        decoration: BoxDecoration(
                          color: AppColors.darkSuccessBg,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.darkSuccessText),
                        ),
                        child: Icon(
                          PhosphorIconsRegular.sealCheck,
                          color: AppColors.darkSuccessText,
                          size: AppSpacing.s24,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s16),
                      Text(
                        'Evaluation Submitted',
                        style: AppTextStyles.title1.copyWith(
                          color: AppColors.darkTextPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s8),
                      Text(
                        'Thank you for contributing to academic excellence. Your response has been securely recorded without student identity linkage.',
                        textAlign: TextAlign.center,
                        style: AppTextStyles.body3.copyWith(
                          color: AppColors.darkTextSecondary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s20),
                      AppButton(
                        text: 'Back to Academics',
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                ),
              ),
            ] else ...[
              // Evaluation Form Card
              AppCard(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.s16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Pedagogical Assessment',
                        style: AppTextStyles.title3.copyWith(
                          color: AppColors.darkTextPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s16),

                      _buildStarSelector(
                        label: '1. Teaching Clarity & Delivery',
                        description: 'How clearly were concepts, algorithms, and proofs explained?',
                        rating: _clarityRating,
                        onRatingChanged: (val) => setState(() => _clarityRating = val),
                      ),

                      const SizedBox(height: AppSpacing.s20),
                      const Divider(color: AppColors.darkBorder, height: 1),
                      const SizedBox(height: AppSpacing.s20),

                      _buildStarSelector(
                        label: '2. Lab Engagement & Practical Work',
                        description: 'Relevance and challenge level of coding assignments and TA sessions.',
                        rating: _engagementRating,
                        onRatingChanged: (val) => setState(() => _engagementRating = val),
                      ),

                      const SizedBox(height: AppSpacing.s20),
                      const Divider(color: AppColors.darkBorder, height: 1),
                      const SizedBox(height: AppSpacing.s20),

                      _buildStarSelector(
                        label: '3. Grading Fairness & Timeliness',
                        description: 'Objective grading rubrics and timely release of scores with feedback.',
                        rating: _fairnessRating,
                        onRatingChanged: (val) => setState(() => _fairnessRating = val),
                      ),

                      const SizedBox(height: AppSpacing.s20),
                      const Divider(color: AppColors.darkBorder, height: 1),
                      const SizedBox(height: AppSpacing.s20),

                      _buildStarSelector(
                        label: '4. Overall Course Experience',
                        description: 'Your holistic evaluation of the course value and syllabus execution.',
                        rating: _overallRating,
                        onRatingChanged: (val) => setState(() => _overallRating = val),
                      ),

                      const SizedBox(height: AppSpacing.s24),
                      const Divider(color: AppColors.darkBorder, height: 1),
                      const SizedBox(height: AppSpacing.s20),

                      Text(
                        'Constructive Comments & Suggestions',
                        style: AppTextStyles.body2.copyWith(
                          color: AppColors.darkTextPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.s8),
                      TextField(
                        controller: _feedbackController,
                        maxLines: 4,
                        style: AppTextStyles.body3.copyWith(color: AppColors.darkTextPrimary),
                        decoration: InputDecoration(
                          hintText: 'What went well? What could the instructor or department improve?',
                          hintStyle: AppTextStyles.body3.copyWith(color: AppColors.darkTextMuted),
                          filled: true,
                          fillColor: AppColors.darkElevated,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppRadius.md),
                            borderSide: const BorderSide(color: AppColors.darkBorder),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppRadius.md),
                            borderSide: const BorderSide(color: AppColors.darkBorder),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppRadius.md),
                            borderSide: const BorderSide(color: AppColors.brightTeal),
                          ),
                        ),
                      ),

                      const SizedBox(height: AppSpacing.s16),

                      Row(
                        children: [
                          Icon(
                            PhosphorIconsRegular.shieldCheck,
                            size: AppSpacing.s16,
                            color: AppColors.darkSuccessText,
                          ),
                          const SizedBox(width: AppSpacing.s8),
                          Expanded(
                            child: Text(
                              'Identity Encryption: Zero student ID data is stored alongside feedback.',
                              style: AppTextStyles.caption5.copyWith(
                                color: AppColors.darkTextMuted,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: AppSpacing.s20),

                      AppButton(
                        text: 'Submit Anonymous Evaluation',
                        onPressed: _handleSubmit,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
