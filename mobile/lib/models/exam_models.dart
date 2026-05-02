class Test {
  final String id;
  final String title;
  final String? area;
  final int? timePerQuestion;
  final int? initialSeed;

  Test({
    required this.id,
    required this.title,
    this.area,
    this.timePerQuestion,
    this.initialSeed,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'area': area,
      'time_per_question': timePerQuestion,
      'initial_seed': initialSeed,
    };
  }

  factory Test.fromMap(Map<String, dynamic> map) {
    return Test(
      id: map['id'],
      title: map['title'],
      area: map['area'],
      timePerQuestion: map['time_per_question'],
      initialSeed: map['initial_seed'],
    );
  }
}

class Question {
  final String id;
  final String? subject;
  final String stem;
  final String questionType;

  Question({
    required this.id,
    this.subject,
    required this.stem,
    required this.questionType,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'subject': subject,
      'stem': stem,
      'question_type': questionType,
    };
  }

  factory Question.fromMap(Map<String, dynamic> map) {
    return Question(
      id: map['id'],
      subject: map['subject'],
      stem: map['stem'],
      questionType: map['question_type'],
    );
  }
}

class Item {
  final String id;
  final String questionId;
  final String text;
  final bool isCorrect;

  Item({
    required this.id,
    required this.questionId,
    required this.text,
    required this.isCorrect,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'question_id': questionId,
      'text': text,
      'is_correct': isCorrect ? 1 : 0,
    };
  }

  factory Item.fromMap(Map<String, dynamic> map) {
    return Item(
      id: map['id'],
      questionId: map['question_id'],
      text: map['text'],
      isCorrect: map['is_correct'] == 1,
    );
  }
}

class TestAttempt {
  final String id;
  final String testId;
  final String userId;
  final String startAt;
  final String? finishedAt;
  final String status;
  final int? randomSeed;
  final bool synced;

  TestAttempt({
    required this.id,
    required this.testId,
    required this.userId,
    required this.startAt,
    this.finishedAt,
    required this.status,
    this.randomSeed,
    this.synced = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'test_id': testId,
      'user_id': userId,
      'start_at': startAt,
      'finished_at': finishedAt,
      'status': status,
      'random_seed': randomSeed,
      'synced': synced ? 1 : 0,
    };
  }

  factory TestAttempt.fromMap(Map<String, dynamic> map) {
    return TestAttempt(
      id: map['id'],
      testId: map['test_id'],
      userId: map['user_id'],
      startAt: map['start_at'],
      finishedAt: map['finished_at'],
      status: map['status'],
      randomSeed: map['random_seed'],
      synced: map['synced'] == 1,
    );
  }
}

class StudentResponse {
  final String id;
  final String attemptId;
  final String questionId;
  final String? textResponse;
  final String? selectedItemId;
  final bool? isCorrect;
  final double? scoreAssigned;
  final bool synced;

  StudentResponse({
    required this.id,
    required this.attemptId,
    required this.questionId,
    this.textResponse,
    this.selectedItemId,
    this.isCorrect,
    this.scoreAssigned,
    this.synced = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'attempt_id': attemptId,
      'question_id': questionId,
      'text_response': textResponse,
      'selected_item_id': selectedItemId,
      'is_correct': isCorrect == null ? null : (isCorrect! ? 1 : 0),
      'score_assigned': scoreAssigned,
      'synced': synced ? 1 : 0,
    };
  }

  factory StudentResponse.fromMap(Map<String, dynamic> map) {
    return StudentResponse(
      id: map['id'],
      attemptId: map['attempt_id'],
      questionId: map['question_id'],
      textResponse: map['text_response'],
      selectedItemId: map['selected_item_id'],
      isCorrect: map['is_correct'] == null ? null : map['is_correct'] == 1,
      scoreAssigned: map['score_assigned'],
      synced: map['synced'] == 1,
    );
  }
}
