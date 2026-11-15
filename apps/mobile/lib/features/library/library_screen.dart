import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_tokens.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_chip.dart';

class LibraryScreen extends StatefulWidget {
  const LibraryScreen({super.key});

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  String _selectedCategory = 'ALL';
  String _searchQuery = '';

  final List<Map<String, dynamic>> _books = [
    {
      'id': 'b-1',
      'title': 'Introduction to Algorithms, 4th Edition',
      'author': 'Thomas H. Cormen, Charles E. Leiserson',
      'category': 'CS',
      'isbn': '978-0262046305',
      'shelf': 'CS-B4-S2',
      'available': 11,
      'total': 12,
      'isEbook': false,
    },
    {
      'id': 'b-2',
      'title': 'Computer Networks: A Systems Approach',
      'author': 'Larry L. Peterson, Bruce S. Davie',
      'category': 'NETWORKING',
      'isbn': '978-0128182000',
      'shelf': 'CS-B2-S1',
      'available': 7,
      'total': 8,
      'isEbook': false,
    },
    {
      'id': 'b-3',
      'title': 'Clean Architecture: A Craftsman Guide',
      'author': 'Robert C. Martin',
      'category': 'SE',
      'isbn': '978-0134494166',
      'shelf': 'CS-B5-S4',
      'available': 14,
      'total': 15,
      'isEbook': false,
    },
    {
      'id': 'b-4',
      'title': 'Deep Learning',
      'author': 'Ian Goodfellow, Yoshua Bengio',
      'category': 'AI',
      'isbn': '978-0262035613',
      'shelf': 'AI-B1-S3',
      'available': 6,
      'total': 6,
      'isEbook': false,
    },
    {
      'id': 'b-5',
      'title': 'Database System Concepts, 7th Edition',
      'author': 'Abraham Silberschatz',
      'category': 'DATABASE',
      'isbn': '978-0078022159',
      'shelf': 'DIGITAL-REPOSITORY',
      'available': 999,
      'total': 999,
      'isEbook': true,
    },
  ];

  void _showBorrowPass(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.darkCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.r2xl)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(AppSpacing.s24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.darkBorder,
                  borderRadius: BorderRadius.circular(AppRadius.full),
                ),
              ),
              const SizedBox(height: AppSpacing.s24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(PhosphorIcons.qrCode(), size: 28, color: AppColors.brightTeal),
                  const SizedBox(width: AppSpacing.s8),
                  Text(
                    'Anti-Theft RFID / Kiosk Pass',
                    style: AppTextStyles.title2.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.darkTextPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.s12),
              Text(
                'Hold this encrypted QR code under the library circulation kiosk scanner to check out volumes automatically.',
                textAlign: TextAlign.center,
                style: AppTextStyles.body5.copyWith(
                  color: AppColors.darkTextSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.s24),
              Container(
                padding: const EdgeInsets.all(AppSpacing.s24),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                ),
                child: Icon(
                  PhosphorIcons.qrCode(),
                  size: 140,
                  color: AppColors.black,
                ),
              ),
              const SizedBox(height: AppSpacing.s16),
              Text(
                'VALID FOR 45 SECONDS • TOKEN ROTATING',
                style: AppTextStyles.caption2.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.brightTeal,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: AppSpacing.s24),
              AppButton(
                label: 'Close Pass',
                variant: AppButtonVariant.outline,
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _books.where((b) {
      final matchCat = _selectedCategory == 'ALL' || b['category'] == _selectedCategory;
      final matchSearch = b['title'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
          b['author'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
          b['isbn'].toString().toLowerCase().contains(_searchQuery.toLowerCase());
      return matchCat && matchSearch;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.darkCanvas,
      appBar: AppBar(
        backgroundColor: AppColors.darkCanvas,
        elevation: 0,
        title: Text(
          'University Library',
          style: AppTextStyles.title1.copyWith(
            fontWeight: FontWeight.w600,
            color: AppColors.darkTextPrimary,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(PhosphorIcons.qrCode(), color: AppColors.brightTeal),
            onPressed: () => _showBorrowPass(context),
            tooltip: 'Kiosk Pass',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.s16),
        children: [
          // Active Loan Banner
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(PhosphorIcons.bookBookmark(), size: 18, color: AppColors.brightTeal),
                        const SizedBox(width: AppSpacing.s8),
                        Text(
                          'Active Book Loan',
                          style: AppTextStyles.title4.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.brightTeal,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.s8,
                        vertical: AppSpacing.s4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.darkSuccessBg,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                      child: Text(
                        'Due in 9 Days',
                        style: AppTextStyles.caption2.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.darkSuccessText,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.s12),
                Text(
                  'Introduction to Algorithms, 4th Edition',
                  style: AppTextStyles.title3.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.darkTextPrimary,
                  ),
                ),
                const SizedBox(height: AppSpacing.s4),
                Text(
                  'Borrowed Nov 09 • Due Nov 23, 2026 • \$0.00 Overdue Fines',
                  style: AppTextStyles.body5.copyWith(
                    color: AppColors.darkTextSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.s16),

          // Search Field
          TextField(
            onChanged: (v) => setState(() => _searchQuery = v),
            style: AppTextStyles.body4.copyWith(
              color: AppColors.darkTextPrimary,
            ),
            decoration: InputDecoration(
              hintText: 'Search title, author, or ISBN...',
              hintStyle: AppTextStyles.body4.copyWith(
                color: AppColors.darkTextSecondary,
              ),
              prefixIcon: Icon(
                PhosphorIcons.magnifyingGlass(),
                size: 18,
                color: AppColors.darkTextSecondary,
              ),
              filled: true,
              fillColor: AppColors.darkCard,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.s16,
                vertical: AppSpacing.s12,
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppRadius.md),
                borderSide: const BorderSide(color: AppColors.darkBorder),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppRadius.md),
                borderSide: const BorderSide(color: AppColors.darkBorder),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.s16),

          // Category Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                AppChip(
                  label: 'All Books',
                  isSelected: _selectedCategory == 'ALL',
                  onTap: () => setState(() => _selectedCategory = 'ALL'),
                ),
                const SizedBox(width: AppSpacing.s8),
                AppChip(
                  label: 'Computer Science',
                  isSelected: _selectedCategory == 'CS',
                  onTap: () => setState(() => _selectedCategory = 'CS'),
                ),
                const SizedBox(width: AppSpacing.s8),
                AppChip(
                  label: 'Networking',
                  isSelected: _selectedCategory == 'NETWORKING',
                  onTap: () => setState(() => _selectedCategory = 'NETWORKING'),
                ),
                const SizedBox(width: AppSpacing.s8),
                AppChip(
                  label: 'Software Eng',
                  isSelected: _selectedCategory == 'SE',
                  onTap: () => setState(() => _selectedCategory = 'SE'),
                ),
                const SizedBox(width: AppSpacing.s8),
                AppChip(
                  label: 'AI & Data',
                  isSelected: _selectedCategory == 'AI',
                  onTap: () => setState(() => _selectedCategory = 'AI'),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.s24),

          // Catalog List
          Text(
            'Library Catalog',
            style: AppTextStyles.title3.copyWith(
              fontWeight: FontWeight.w600,
              color: AppColors.darkTextPrimary,
            ),
          ),
          const SizedBox(height: AppSpacing.s12),

          ...filtered.map((book) {
            final isAvailable = (book['available'] as int) > 0;
            final isEbook = book['isEbook'] as bool;

            return Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.s12),
              child: AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 48,
                          height: 64,
                          decoration: BoxDecoration(
                            color: AppColors.darkElevated,
                            borderRadius: BorderRadius.circular(AppRadius.sm),
                            border: Border.all(color: AppColors.darkBorder),
                          ),
                          child: Center(
                            child: Icon(
                              isEbook ? PhosphorIcons.deviceTablet() : PhosphorIcons.book(),
                              size: 24,
                              color: AppColors.brightTeal,
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.s12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                book['title'],
                                style: AppTextStyles.title4.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.darkTextPrimary,
                                ),
                              ),
                              const SizedBox(height: AppSpacing.s4),
                              Text(
                                book['author'],
                                style: AppTextStyles.body5.copyWith(
                                  color: AppColors.darkTextSecondary,
                                ),
                              ),
                              const SizedBox(height: AppSpacing.s8),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: AppSpacing.s8,
                                      vertical: AppSpacing.s2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.darkElevated,
                                      borderRadius: BorderRadius.circular(AppRadius.xs),
                                      border: Border.all(color: AppColors.darkBorder),
                                    ),
                                    child: Text(
                                      'Shelf: ${book['shelf']}',
                                      style: AppTextStyles.caption2.copyWith(
                                        color: AppColors.brightTeal,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: AppSpacing.s8),
                                  Text(
                                    '${book['available']} / ${book['total']} copies',
                                    style: AppTextStyles.caption1.copyWith(
                                      color: isAvailable
                                          ? AppColors.darkSuccessText
                                          : AppColors.darkWarningText,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.s12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        if (isEbook)
                          AppButton(
                            label: 'Read E-Book',
                            variant: AppButtonVariant.primary,
                            size: AppButtonSize.small,
                            icon: PhosphorIcons.arrowSquareOut(),
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Opening digital PDF in secure reader...'),
                                ),
                              );
                            },
                          )
                        else
                          AppButton(
                            label: isAvailable ? 'Reserve Copy' : 'Join Waitlist',
                            variant: isAvailable
                                ? AppButtonVariant.outline
                                : AppButtonVariant.ghost,
                            size: AppButtonSize.small,
                            icon: PhosphorIcons.bookmarkSimple(),
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    isAvailable
                                        ? 'Reserved copy for pickup at Central Circulation Desk.'
                                        : 'Added to notification queue when volume is returned.',
                                  ),
                                ),
                              );
                            },
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
    );
  }
}
