// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appTitle => 'Smart EDU';

  @override
  String get tagline => 'حرم جامعي واحد في كل جيب وعلى كل مكتب.';

  @override
  String get signInHeading => 'تسجيل الدخول إلى Smart EDU';

  @override
  String get signInSubtitle =>
      'استخدم بريدك الجامعي لمتابعة محاضراتك ونتائجك ورسومك.';

  @override
  String get universityEmailLabel => 'البريد الجامعي';

  @override
  String get passwordLabel => 'كلمة المرور';

  @override
  String get signInButton => 'تسجيل الدخول';

  @override
  String get continueWithUniversity => 'المتابعة بالحساب الجامعي';

  @override
  String get mfaHeading => 'أدخل رمز التحقق';

  @override
  String get mfaSubtitle => 'تتطلب حسابات الموظفين رمز تحقق من ستة أرقام.';

  @override
  String get verifyCodeButton => 'تأكيد الرمز';

  @override
  String get switchRoleTitle => 'تبديل الدور النشط';

  @override
  String get navHome => 'الرئيسية';

  @override
  String get navSchedule => 'الجدول';

  @override
  String get navCourses => 'المقررات';

  @override
  String get navInbox => 'الرسائل';

  @override
  String get navProfile => 'الملف';

  @override
  String get offlineCacheSynced => 'التخزين المؤقت جاهز';

  @override
  String get signOutButton => 'تسجيل الخروج';
}
