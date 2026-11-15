import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class ChatScreen extends StatefulWidget {
  final String courseCode;
  final String channelTitle;

  const ChatScreen({
    super.key,
    this.courseCode = 'CSE204-A',
    this.channelTitle = 'Data Structures Discussion',
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _textController = TextEditingController();

  final List<Map<String, dynamic>> _messages = [
    {
      'id': '1',
      'sender': 'Dr. Tariq Mahmud',
      'role': 'Faculty',
      'isMe': false,
      'text':
          'Welcome to the CSE204 Section A channel. Please post questions about Assignment 2 (Red-Black Trees & AVL Balance) here.',
      'time': '10:00 AM',
    },
    {
      'id': '2',
      'sender': 'Rafiq Hasan',
      'role': 'Student',
      'isMe': true,
      'text':
          'Sir, for problem 3 in Assignment 2, should we recolor before or after performing the rotation?',
      'time': '10:15 AM',
    },
    {
      'id': '3',
      'sender': 'Dr. Tariq Mahmud',
      'role': 'Faculty',
      'isMe': false,
      'text':
          'Good question Rafiq. Check case 1 vs case 2: recolor if the uncle node is red, rotate if the uncle is black.',
      'time': '10:20 AM',
    },
  ];

  void _handleSend() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'sender': 'Rafiq Hasan',
        'role': 'Student',
        'isMe': true,
        'text': text,
        'time': 'Just now',
      });
      _textController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkCanvas : AppColors.lightCanvas,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.channelTitle,
              style: AppTextStyles.title3.copyWith(
                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
            Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: AppColors.teal,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: AppSpacing.s4),
                Text(
                  '${widget.courseCode} • 38 Online',
                  style: AppTextStyles.caption3.copyWith(
                    color: AppColors.teal,
                  ),
                ),
              ],
            ),
          ],
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
        child: Column(
          children: [
            // Pinned Notice Banner
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.s16,
                vertical: AppSpacing.s8,
              ),
              color: isDark ? AppColors.darkElevated : AppColors.lightElevated,
              child: Row(
                children: [
                  Icon(
                    PhosphorIcons.pushPin(),
                    color: AppColors.teal,
                    size: 16,
                  ),
                  const SizedBox(width: AppSpacing.s8),
                  Expanded(
                    child: Text(
                      'Pinned: Assignment 2 test cases published in course repo',
                      style: AppTextStyles.caption2.copyWith(
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),

            // Messages List
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.s16,
                  vertical: AppSpacing.s12,
                ),
                itemCount: _messages.length,
                itemBuilder: (context, index) {
                  final msg = _messages[index];
                  final isMe = msg['isMe'] as bool;
                  return _buildMessageBubble(msg, isMe, isDark);
                },
              ),
            ),

            // Chat Input Box
            Container(
              padding: const EdgeInsets.all(AppSpacing.s12),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkElevated : AppColors.lightElevated,
                border: Border(
                  top: BorderSide(
                    color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  ),
                ),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(
                      PhosphorIcons.paperclip(),
                      color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                    ),
                    onPressed: () {},
                  ),
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      style: AppTextStyles.body5.copyWith(
                        color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Message ${widget.courseCode}...',
                        hintStyle: AppTextStyles.body5.copyWith(
                          color: isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted,
                        ),
                        border: InputBorder.none,
                      ),
                      onSubmitted: (_) => _handleSend(),
                    ),
                  ),
                  IconButton(
                    icon: Icon(
                      PhosphorIcons.paperPlaneTilt(),
                      color: AppColors.teal,
                    ),
                    onPressed: _handleSend,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageBubble(
    Map<String, dynamic> msg,
    bool isMe,
    bool isDark,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.s6),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isMe) ...[
            CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.ink,
              child: Text(
                (msg['sender'] as String)[0],
                style: AppTextStyles.caption2.copyWith(
                  color: AppColors.teal,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.s8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.s12),
              decoration: BoxDecoration(
                color: isMe
                    ? AppColors.ink
                    : (isDark ? AppColors.darkCard : AppColors.lightCard),
                borderRadius: BorderRadius.circular(AppRadius.r2xl),
                border: Border.all(
                  color: isMe
                      ? AppColors.tealDeep
                      : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                ),
              ),
              child: Column(
                crossAxisAlignment:
                    isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  if (!isMe)
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          msg['sender'] as String,
                          style: AppTextStyles.caption2.copyWith(
                            color: AppColors.teal,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.s4),
                        AppChip(
                          label: msg['role'] as String,
                          tone: msg['role'] == 'Faculty' ? ChipTone.info : ChipTone.neutral,
                        ),
                      ],
                    ),
                  if (!isMe) const SizedBox(height: AppSpacing.s4),
                  Text(
                    msg['text'] as String,
                    style: AppTextStyles.body5.copyWith(
                      color: isMe
                          ? AppColors.white
                          : (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.s4),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        msg['time'] as String,
                        style: AppTextStyles.caption3.copyWith(
                          color: isMe
                              ? AppColors.white70
                              : (isDark ? AppColors.darkTextMuted : AppColors.lightTextMuted),
                        ),
                      ),
                      if (isMe) ...[
                        const SizedBox(width: AppSpacing.s4),
                        Icon(
                          PhosphorIcons.checkCircle(),
                          size: 12,
                          color: AppColors.teal,
                        ),
                      ],
                    ],
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
