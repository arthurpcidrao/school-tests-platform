import 'package:flutter/material.dart';
import 'dart:async';
import '../models/exam_models.dart';

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

  void startTestMock() {
    _isLoading = true;
    notifyListeners();

    // Mock data for UI development
    _activeTest = Test(id: '1', title: 'Cálculo Diferencial II', timePerQuestion: 120);
    final q1 = Question(id: 'q1', stem: 'Qual é a derivada de x²?', questionType: 'FECHADA');
    final q2 = Question(id: 'q2', stem: 'Qual é a integral de 2x?', questionType: 'FECHADA');
    
    _questions = [q1, q2];
    _questionItems = {
      'q1': [
        Item(id: 'i1', questionId: 'q1', text: 'x', isCorrect: false),
        Item(id: 'i2', questionId: 'q1', text: '2x', isCorrect: true),
        Item(id: 'i3', questionId: 'q1', text: 'x²', isCorrect: false),
        Item(id: 'i4', questionId: 'q1', text: '2', isCorrect: false),
      ],
      'q2': [
        Item(id: 'i5', questionId: 'q2', text: 'x²', isCorrect: true),
        Item(id: 'i6', questionId: 'q2', text: 'x', isCorrect: false),
      ],
    };
    
    _remainingSeconds = (_activeTest?.timePerQuestion ?? 60) * _questions.length;
    _startTimer();
    
    _isLoading = false;
    notifyListeners();
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
        _forceSubmitTest();
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

  void _forceSubmitTest() {
    // TODO: Salvar StudentResponses localmente no SQLite e sync com API
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
