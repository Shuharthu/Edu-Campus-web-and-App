// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Smart EDU';

  @override
  String get tagline => 'One campus, in every pocket and on every desk.';

  @override
  String get signInHeading => 'Sign in to Smart EDU';

  @override
  String get signInSubtitle =>
      'Use your university email to see your classes, results and fees.';

  @override
  String get universityEmailLabel => 'University email';

  @override
  String get passwordLabel => 'Password';

  @override
  String get signInButton => 'Sign in';

  @override
  String get continueWithUniversity => 'Continue with university account';

  @override
  String get mfaHeading => 'Enter verification code';

  @override
  String get mfaSubtitle =>
      'Staff accounts require a 6 digit authenticator code.';

  @override
  String get verifyCodeButton => 'Verify code';

  @override
  String get switchRoleTitle => 'Switch active role';

  @override
  String get navHome => 'Home';

  @override
  String get navSchedule => 'Schedule';

  @override
  String get navCourses => 'Courses';

  @override
  String get navInbox => 'Inbox';

  @override
  String get navProfile => 'Profile';

  @override
  String get offlineCacheSynced => 'Offline cache ready';

  @override
  String get signOutButton => 'Sign out';
}
