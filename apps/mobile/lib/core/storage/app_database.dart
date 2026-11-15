import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

class CachedTimetableSlots extends Table {
  TextColumn get id => text()();
  TextColumn get courseTitle => text()();
  TextColumn get roomLabel => text()();
  TextColumn get instructorName => text()();
  IntColumn get dayOfWeek => integer()();
  TextColumn get startTime => text()();
  TextColumn get endTime => text()();
  TextColumn get status => text()();
  DateTimeColumn get syncedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

class CachedNotices extends Table {
  TextColumn get id => text()();
  TextColumn get title => text()();
  TextColumn get body => text()();
  DateTimeColumn get publishedAt => dateTime()();
  BoolColumn get isRead => boolean().withDefault(const Constant(false))();
  DateTimeColumn get syncedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

class CachedDigitalIds extends Table {
  TextColumn get studentId => text()();
  TextColumn get fullName => text()();
  TextColumn get programLabel => text()();
  TextColumn get cardNumber => text()();
  TextColumn get qrSeed => text()();
  DateTimeColumn get syncedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {studentId};
}

@DriftDatabase(tables: [CachedTimetableSlots, CachedNotices, CachedDigitalIds])
class AppDatabase {
  AppDatabase._(this._executor);

  final QueryExecutor _executor;

  static Future<AppDatabase> open() async {
    final dir = await getApplicationDocumentsDirectory();
    final file = File(p.join(dir.path, 'smart_edu_offline.sqlite'));
    return AppDatabase._(NativeDatabase.createInBackground(file));
  }

  QueryExecutor get executor => _executor;
}
