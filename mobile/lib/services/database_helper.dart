import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('eduksim.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    const idType = 'TEXT PRIMARY KEY';
    const textType = 'TEXT NOT NULL';
    const textNullable = 'TEXT';
    const boolType = 'INTEGER NOT NULL';
    const intNullable = 'INTEGER';

    // Tabelas espelhando o backend para funcionamento Offline-First

    await db.execute('''
      CREATE TABLE tests (
        id $idType,
        title $textType,
        area $textNullable,
        time_per_question $intNullable,
        initial_seed $intNullable
      )
    ''');

    await db.execute('''
      CREATE TABLE questions (
        id $idType,
        subject $textNullable,
        stem $textType,
        question_type $textType
      )
    ''');

    await db.execute('''
      CREATE TABLE test_questions (
        id $idType,
        test_id $textType,
        question_id $textType,
        order_index $intNullable,
        weight REAL,
        FOREIGN KEY (test_id) REFERENCES tests (id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
      )
    ''');

    await db.execute('''
      CREATE TABLE items (
        id $idType,
        question_id $textType,
        text $textType,
        is_correct $boolType,
        FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
      )
    ''');

    await db.execute('''
      CREATE TABLE test_attempts (
        id $idType,
        test_id $textType,
        user_id $textType,
        start_at $textType,
        finished_at $textNullable,
        status $textType,
        random_seed $intNullable,
        synced $boolType DEFAULT 0
      )
    ''');

    await db.execute('''
      CREATE TABLE student_responses (
        id $idType,
        attempt_id $textType,
        question_id $textType,
        text_response $textNullable,
        selected_item_id $textNullable,
        is_correct $intNullable,
        score_assigned REAL,
        synced $boolType DEFAULT 0,
        FOREIGN KEY (attempt_id) REFERENCES test_attempts (id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
      )
    ''');
  }

  Future<void> close() async {
    final db = await instance.database;
    db.close();
  }
}
