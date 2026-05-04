import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:async';
import 'dart:math';
import '../models/exam_models.dart';
import '../services/api_service.dart';
import '../core/db_helper.dart';

class TestProvider extends ChangeNotifier {
  bool _isLoading = false;
  Test? _activeTest;
  List<Question> _questions = [];
  Map<String, List<Item>> _questionItems = {};
  Map<String, String> _selectedAnswers = {}; // questionId -> itemId
  
  int _currentQuestionIndex = 0;
  int _remainingSeconds = 0;
  Timer? _timer;
  
  // Anti-Fraude
  DateTime? _lastPausedTime;
  bool _isBlocked = false;
  
  bool get isLoading => _isLoading;
  Test? get activeTest => _activeTest;
  List<Question> get questions => _questions;
  int get currentQuestionIndex => _currentQuestionIndex;
  Question? get currentQuestion => _questions.isNotEmpty ? _questions[_currentQuestionIndex] : null;
  List<Item> get currentItems => currentQuestion != null ? (_questionItems[currentQuestion!.id] ?? []) : [];
  int get remainingSeconds => _remainingSeconds;
  bool get isBlocked => _isBlocked;
  
  double get progressPercentage {
    if (_questions.isEmpty) return 0.0;
    int answered = _selectedAnswers.length;
    return answered / _questions.length;
  }

  String? get currentSelectedAnswer => currentQuestion != null ? _selectedAnswers[currentQuestion!.id] : null;

  List<Test> _assignedTests = [];
  Map<String, bool> _downloadedStatus = {};

  List<Test> get assignedTests => _assignedTests;

  bool isTestDownloaded(String testId) {
    return _downloadedStatus[testId] ?? false;
  }

  Future<void> loadAssignedTests() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.instance.fetchAssignedTests();
      if (response.statusCode == 200) {
        final List data = response.data;
        _assignedTests = data.map((json) => Test.fromMap(json)).toList();
        
        // Verificar status de download para cada teste (apenas se não for Web)
        if (!kIsWeb) {
          for (var test in _assignedTests) {
            try {
              final isDownloaded = await DatabaseHelper.instance.isTestDownloaded(test.id);
              _downloadedStatus[test.id] = isDownloaded;
            } catch (e) {
              debugPrint("Erro ao verificar SQLite: $e");
            }
          }
        }
      }
    } catch (e) {
      debugPrint("Erro ao carregar simulados: $e");
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> downloadTest(String testId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.instance.fetchFullTest(testId);
      if (response.statusCode == 200) {
        await DatabaseHelper.instance.saveFullTest(response.data);
        _downloadedStatus[testId] = true;
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint("Erro ao baixar simulado: $e");
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> startTest(String testId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final test = await DatabaseHelper.instance.getTest(testId);
      if (test != null) {
        _activeTest = test;
        _questions = await DatabaseHelper.instance.getQuestionsForTest(testId);
        
        _questionItems.clear();
        for (var q in _questions) {
          final items = await DatabaseHelper.instance.getItemsForQuestion(q.id);
          _questionItems[q.id] = items;
        }

        final rng = Random(_activeTest!.initialSeed ?? DateTime.now().millisecondsSinceEpoch);
        _questions.shuffle(rng);
        for (var q in _questions) {
          _questionItems[q.id]?.shuffle(rng);
        }

        _currentQuestionIndex = 0;
        _selectedAnswers.clear();
        _isBlocked = false;
        
        _remainingSeconds = (_activeTest?.timePerQuestion ?? 60) * _questions.length;
        _startTimer();
      }
    } catch (e) {
      debugPrint("Erro ao iniciar teste do SQLite: $e");
    }
    
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> startTestOnline(String testId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.instance.fetchFullTest(testId);
      if (response.statusCode == 200) {
        final data = response.data;
        _activeTest = Test(
          id: data['id'],
          title: data['title'],
          area: data['area'],
          timePerQuestion: data['time_per_question'],
          initialSeed: data['initial_seed'],
        );
        
        final questionsList = data['questions'] as List;
        _questions = questionsList.map((q) => Question(
          id: q['id'],
          stem: q['stem'],
          questionType: q['question_type'],
          subject: q['subject'],
        )).toList();

        _questionItems.clear();
        for (var q in questionsList) {
          final itemsList = q['items'] as List;
          _questionItems[q['id']] = itemsList.map((item) => Item(
            id: item['id'],
            questionId: q['id'],
            text: item['text'],
            isCorrect: item['is_correct'] == true,
          )).toList();
        }

        final rng = Random(_activeTest!.initialSeed ?? DateTime.now().millisecondsSinceEpoch);
        _questions.shuffle(rng);
        for (var q in _questions) {
          _questionItems[q.id]?.shuffle(rng);
        }

        _currentQuestionIndex = 0;
        _selectedAnswers.clear();
        _isBlocked = false;
        
        _remainingSeconds = (_activeTest?.timePerQuestion ?? 60) * _questions.length;
        _startTimer();
        
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint("Erro ao iniciar teste online: $e");
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  void selectAnswer(String itemId) {
    if (currentQuestion != null) {
      _selectedAnswers[currentQuestion!.id] = itemId;
      notifyListeners();
    }
  }

  void nextQuestion() {
    if (_currentQuestionIndex < _questions.length - 1) {
      _currentQuestionIndex++;
      notifyListeners();
    }
  }

  void previousQuestion() {
    if (_currentQuestionIndex > 0) {
      _currentQuestionIndex--;
      notifyListeners();
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0 && !_isBlocked) {
        _remainingSeconds--;
        notifyListeners();
      } else if (_remainingSeconds <= 0) {
        _timer?.cancel();
        submitTest();
      }
    });
  }

  // Lógica Anti-Fraude via AppLifecycle
  void onAppPaused() {
    _lastPausedTime = DateTime.now();
  }

  void onAppResumed() {
    if (_lastPausedTime != null) {
      final diff = DateTime.now().difference(_lastPausedTime!);
      if (diff.inSeconds > 10) {
        _isBlocked = true;
        _timer?.cancel();
        notifyListeners();
      }
      _lastPausedTime = null;
    }
  }

  void finishTest() {
    _timer?.cancel();
    _isBlocked = true;
    notifyListeners();
  }

  Future<bool> submitTest() async {
    if (_activeTest == null) return false;
    _isLoading = true;
    notifyListeners();

    try {
      final answers = _selectedAnswers.entries.map((e) => {
        'question_id': e.key,
        'item_id': e.value,
      }).toList();
      
      final res = await ApiService.instance.submitAttempt(_activeTest!.id, answers);
      if (res.statusCode == 201) {
        _activeTest = null;
        _isLoading = false;
        notifyListeners();
        // Recarregar simulados disponíveis para remover o recém-finalizado
        loadAssignedTests();
        return true;
      }
    } catch (e) {
      debugPrint("Erro submitTest: $e");
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
