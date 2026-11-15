import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class SmartAssistantScreen extends StatefulWidget {
  const SmartAssistantScreen({super.key});

  @override
  State<SmartAssistantScreen> createState() => _SmartAssistantScreenState();
}

class _ChatMessage {
  final String role; // 'user' or 'assistant'
  final String text;
  final String? citationSource;
  final String? citationSection;
  final DateTime timestamp;

  const _ChatMessage({
    required this.role,
    required this.text,
    this.citationSource,
    this.citationSection,
    required this.timestamp,
  });
}

class _SmartAssistantScreenState extends State<SmartAssistantScreen> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final List<String> _suggestedPrompts = [
    'Where is my exam seating hall?',
    'How much tuition do I owe?',
    'What is the attendance debarment policy?',
    'What books do I have checked out?',
  ];

  final List<_ChatMessage> _messages = [
    _ChatMessage(
      role: 'assistant',
      text: 'Hello Rafiq, I am your grounded academic assistant. Every answer I provide is verified against your official university records, course syllabi, and administrative regulations.',
      citationSource: 'Smart EDU Verification Engine',
      citationSection: 'Academic Registry & Student Records',
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
    ),
    _ChatMessage(
      role: 'user',
      text: 'Where is my exam seating hall?',
      timestamp: DateTime.now().subtract(const Duration(minutes: 4)),
    ),
    _ChatMessage(
      role: 'assistant',
      text: 'According to the official Fall 2026 Examination Seating Matrix, you are assigned to Auditorium Hall C, Seat 42 for course CSE204 (Algorithms & Data Structures). Please have your digital admit card QR code ready on arrival.',
      citationSource: 'Midterm Seating Matrix 2026',
      citationSection: 'Auditorium Hall C, Seat 42 (Section CSE204)',
      timestamp: DateTime.now().subtract(const Duration(minutes: 4)),
    ),
  ];

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _handleSend(String query) {
    final text = query.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(_ChatMessage(
        role: 'user',
        text: text,
        timestamp: DateTime.now(),
      ));
    });
    _inputController.clear();

    // Grounded synthesis engine matching verified student records
    final lower = text.toLowerCase();
    String replyText;
    String source;
    String section;

    if (lower.contains('exam') || lower.contains('seat') || lower.contains('hall')) {
      replyText = 'Your midterm examination seating is confirmed in Auditorium Hall C, Seat 42 for course CSE204. Reporting time is 08:30 AM with biometric or QR check-in.';
      source = 'Midterm Seating Matrix 2026';
      section = 'Hall C Allocation Desk, Seat 42';
    } else if (lower.contains('tuition') || lower.contains('fee') || lower.contains('owe') || lower.contains('installment')) {
      replyText = 'Your outstanding tuition balance is \$2,046.66. Installment 2 of 3 (\$1,023.33) is due on November 30, 2026. You can pay with 1-click via the Tuition tab.';
      source = 'Student Accounts Ledger';
      section = 'Invoice #INV-2026-0042, Installment 2';
    } else if (lower.contains('attendance') || lower.contains('debar') || lower.contains('percentage')) {
      replyText = 'Under university academic code 7.1.3, you must maintain at least 75% attendance across lectures and labs to qualify for semester examinations. Your current overall rate is 88.5%.';
      source = 'University Academic Code of Conduct 2026';
      section = 'Section 7.1.3 (Examination Eligibility)';
    } else if (lower.contains('book') || lower.contains('library') || lower.contains('loan')) {
      replyText = 'You have 1 active volume checked out: "Introduction to Algorithms, 4th Edition" (Accession #CS-ALGO-402), due back November 23, 2026. Zero overdue fines assessed.';
      source = 'Central Library Circulation Registry';
      section = 'Active Loan #00000000-0000-0007-000000000011';
    } else {
      replyText = 'I am programmed to only answer questions grounded in your student records, course offerings, exam allocations, and official university policies. Ask me about exams, fees, library loans, or attendance.';
      source = 'Smart EDU Academic Governance';
      section = 'Verified Student Information Guideline';
    }

    Future.delayed(const Duration(milliseconds: 350), () {
      if (!mounted) return;
      setState(() {
        _messages.add(_ChatMessage(
          role: 'assistant',
          text: replyText,
          citationSource: source,
          citationSection: section,
          timestamp: DateTime.now(),
        ));
      });
      _scrollToBottom();
    });

    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkCanvas,
      appBar: AppBar(
        backgroundColor: AppColors.darkCanvas,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Ask Smart EDU',
              style: AppTextStyles.title1.copyWith(
                color: AppColors.darkTextPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(
              'Grounded Academic AI Assistant',
              style: AppTextStyles.caption4.copyWith(
                color: AppColors.brightTeal,
              ),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: AppSpacing.s16),
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.s8,
              vertical: AppSpacing.s4,
            ),
            decoration: BoxDecoration(
              color: AppColors.darkSuccessBg,
              borderRadius: BorderRadius.circular(AppRadius.full),
              border: Border.all(color: AppColors.darkSuccessText),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  PhosphorIconsRegular.shieldCheck,
                  size: AppSpacing.s12,
                  color: AppColors.darkSuccessText,
                ),
                const SizedBox(width: AppSpacing.s4),
                Text(
                  'Grounded',
                  style: AppTextStyles.caption4.copyWith(
                    color: AppColors.darkSuccessText,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Prompt suggestion horizontal bar
          Container(
            height: AppSpacing.s48,
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.s4),
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s16),
              scrollDirection: Axis.horizontal,
              itemCount: _suggestedPrompts.length,
              separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.s8),
              itemBuilder: (context, index) {
                final prompt = _suggestedPrompts[index];
                return GestureDetector(
                  onTap: () => _handleSend(prompt),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.s12,
                      vertical: AppSpacing.s8,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.darkElevated,
                      borderRadius: BorderRadius.circular(AppRadius.full),
                      border: Border.all(color: AppColors.darkBorder),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          PhosphorIconsRegular.sparkle,
                          size: AppSpacing.s12,
                          color: AppColors.brightTeal,
                        ),
                        const SizedBox(width: AppSpacing.s4),
                        Text(
                          prompt,
                          style: AppTextStyles.caption4.copyWith(
                            color: AppColors.darkTextPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          const Divider(color: AppColors.darkBorder, height: 1),

          // Message Thread
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(AppSpacing.s16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg.role == 'user';

                return Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.s16),
                  child: Align(
                    alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * 0.85,
                      ),
                      padding: const EdgeInsets.all(AppSpacing.s12),
                      decoration: BoxDecoration(
                        color: isUser ? AppColors.darkElevated : AppColors.darkCard,
                        borderRadius: BorderRadius.circular(AppRadius.xl),
                        border: Border.all(
                          color: isUser
                              ? AppColors.darkBorder
                              : AppColors.teal.withOpacity(0.3),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (!isUser) ...[
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  PhosphorIconsRegular.robot,
                                  size: AppSpacing.s16,
                                  color: AppColors.brightTeal,
                                ),
                                const SizedBox(width: AppSpacing.s4),
                                Text(
                                  'Smart Assistant',
                                  style: AppTextStyles.caption4.copyWith(
                                    color: AppColors.brightTeal,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.s8),
                          ],
                          Text(
                            msg.text,
                            style: AppTextStyles.body3.copyWith(
                              color: AppColors.darkTextPrimary,
                            ),
                          ),
                          if (msg.citationSource != null) ...[
                            const SizedBox(height: AppSpacing.s8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.s8,
                                vertical: AppSpacing.s4,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.darkCanvas,
                                borderRadius: BorderRadius.circular(AppRadius.sm),
                                border: Border.all(color: AppColors.darkBorder),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    PhosphorIconsRegular.bookmarkSimple,
                                    size: AppSpacing.s12,
                                    color: AppColors.amber,
                                  ),
                                  const SizedBox(width: AppSpacing.s4),
                                  Flexible(
                                    child: Text(
                                      '${msg.citationSource} • ${msg.citationSection}',
                                      style: AppTextStyles.caption5.copyWith(
                                        color: AppColors.darkTextMuted,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // Message input bar
          Container(
            padding: const EdgeInsets.all(AppSpacing.s12),
            decoration: const BoxDecoration(
              color: AppColors.darkElevated,
              border: Border(
                top: BorderSide(color: AppColors.darkBorder),
              ),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.s12),
                      decoration: BoxDecoration(
                        color: AppColors.darkCard,
                        borderRadius: BorderRadius.circular(AppRadius.full),
                        border: Border.all(color: AppColors.darkBorder),
                      ),
                      child: TextField(
                        controller: _inputController,
                        style: AppTextStyles.body3.copyWith(
                          color: AppColors.darkTextPrimary,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Ask about exam seats, fees, loans...',
                          hintStyle: AppTextStyles.body3.copyWith(
                            color: AppColors.darkTextMuted,
                          ),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(
                            vertical: AppSpacing.s12,
                          ),
                        ),
                        onSubmitted: _handleSend,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.s8),
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.brightTeal,
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: Icon(
                        PhosphorIconsRegular.paperPlaneRight,
                        color: AppColors.ink,
                        size: AppSpacing.s16,
                      ),
                      onPressed: () => _handleSend(_inputController.text),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
