import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/exam_models.dart';

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
    await db.execute('''
      CREATE TABLE tests (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        area TEXT,
        time_per_question INTEGER,
        initial_seed INTEGER
      )
    ''');

    await db.execute('''
      CREATE TABLE questions (
        id TEXT PRIMARY KEY,
        test_id TEXT NOT NULL,
        subject TEXT,
        stem TEXT NOT NULL,
        question_type TEXT NOT NULL,
        FOREIGN KEY (test_id) REFERENCES tests (id) ON DELETE CASCADE
      )
    ''');

    await db.execute('''
      CREATE TABLE items (
        id TEXT PRIMARY KEY,
        question_id TEXT NOT NULL,
        text TEXT NOT NULL,
        is_correct INTEGER NOT NULL,
        FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
      )
    ''');
  }

  Future<void> saveFullTest(Map<String, dynamic> fullTest) async {
    final db = await instance.database;
    
    await db.transaction((txn) async {
      // 1. Save Test
      await txn.insert('tests', {
        'id': fullTest['id'],
        'title': fullTest['title'],
        'area': fullTest['area'],
        'time_per_question': fullTest['time_per_question'],
        'initial_seed': fullTest['initial_seed'],
      }, conflictAlgorithm: ConflictAlgorithm.replace);

      // 2. Save Questions and Items
      final questionsList = fullTest['questions'] as List;
      for (var q in questionsList) {
        await txn.insert('questions', {
          'id': q['id'],
          'test_id': fullTest['id'],
          'subject': q['subject'],
          'stem': q['stem'],
          'question_type': q['question_type'],
        }, conflictAlgorithm: ConflictAlgorithm.replace);

        final itemsList = q['items'] as List;
        for (var item in itemsList) {
          await txn.insert('items', {
            'id': item['id'],
            'question_id': q['id'],
            'text': item['text'],
            'is_correct': item['is_correct'] == true ? 1 : 0,
          }, conflictAlgorithm: ConflictAlgorithm.replace);
        }
      }
    });
  }

  Future<bool> isTestDownloaded(String testId) async {
    final db = await instance.database;
    final maps = await db.query(
      'tests',
      columns: ['id'],
      where: 'id = ?',
      whereArgs: [testId],
    );
    return maps.isNotEmpty;
  }

  Future<Test?> getTest(String testId) async {
    final db = await instance.database;
    final maps = await db.query(
      'tests',
      where: 'id = ?',
      whereArgs: [testId],
    );
    if (maps.isNotEmpty) {
      return Test.fromMap(maps.first);
    }
    return null;
  }

  Future<List<Question>> getQuestionsForTest(String testId) async {
    final db = await instance.database;
    final maps = await db.query(
      'questions',
      where: 'test_id = ?',
      whereArgs: [testId],
    );
    return maps.map((map) => Question.fromMap(map)).toList();
  }

  Future<List<Item>> getItemsForQuestion(String questionId) async {
    final db = await instance.database;
    final maps = await db.query(
      'items',
      where: 'question_id = ?',
      whereArgs: [questionId],
    );
    return maps.map((map) => Item.fromMap(map)).toList();
  }

  Future<void> deleteTest(String testId) async {
    final db = await instance.database;
    // Foreign keys with CASCADE will delete questions and items if enabled,
    // but in sqflite foreign keys are disabled by default. We should just delete manually or enable pragmas.
    await db.execute('PRAGMA foreign_keys = ON');
    await db.delete(
      'tests',
      where: 'id = ?',
      whereArgs: [testId],
    );
  }
}
