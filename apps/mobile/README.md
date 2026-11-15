# Smart EDU Mobile (`apps/mobile`)

Flutter 3 / Dart 3 single codebase for iOS and Android (Student, Parent, Faculty, and Admin summary modes).

## Fonts
`Geist-{Regular,Medium,SemiBold}.ttf` and `GeistMono-{Regular,Medium,SemiBold}.ttf` are bundled in `assets/fonts/`.

## Platform Runners & Build Commands
On a workstation with the Flutter SDK (`>=3.4.0`) installed:

```bash
cd apps/mobile
# First-time native platform runner generation (creates android/ and ios/ if absent)
flutter create --platforms=android,ios .
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter gen-l10n
flutter analyze --fatal-infos
flutter test

# Dev / Staging / Production runs
flutter run --flavor dev -t lib/main_dev.dart
flutter run --flavor staging -t lib/main_staging.dart
flutter run --flavor production -t lib/main_production.dart

# Release builds
flutter build apk --release -t lib/main_production.dart
```
