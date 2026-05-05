from typing import List, Optional
import uuid
from ninja import Router, Schema
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from .models import Question, Item, Test, TestQuestion, TestAttempt, StudentResponse
from accounts.api import AuthBearer

router = Router(auth=AuthBearer())

# Schemas para Question
class ItemSchema(Schema):
    id: uuid.UUID = None
    text: str
    image_url: Optional[str] = None
    is_correct: bool = False

class QuestionIn(Schema):
    subject: str
    content: str
    stem: str
    image_url: Optional[str] = None
    competence_bncc: Optional[str] = None
    skill_bncc: Optional[str] = None
    question_type: str = "FECHADA"
    items: List[ItemSchema] = []

class QuestionOut(Schema):
    id: uuid.UUID
    subject: str
    content: str
    stem: str
    image_url: Optional[str] = None
    question_type: str
    items: List[ItemSchema]

# Schemas para Test
class TestQuestionSchema(Schema):
    question_id: uuid.UUID
    order_index: int
    weight: float = 1.0

class TestIn(Schema):
    title: str
    area: Optional[str] = None
    start_at: Optional[str] = None
    end_at: Optional[str] = None
    time_per_question: Optional[int] = None
    allowed_students: Optional[list] = None
    questions: List[TestQuestionSchema] = []

class TestOut(Schema):
    id: uuid.UUID
    title: str
    area: Optional[str] = None
    time_per_question: Optional[int] = None
    initial_seed: Optional[int] = None

class FullQuestionSchema(Schema):
    id: uuid.UUID
    subject: Optional[str] = None
    stem: str
    question_type: str
    items: List[ItemSchema]

class FullTestSchema(Schema):
    id: uuid.UUID
    title: str
    area: Optional[str] = None
    time_per_question: Optional[int] = None
    initial_seed: Optional[int] = None
    questions: List[FullQuestionSchema]

class TopStudentSchema(Schema):
    email: str
    score: float

class DashboardStatsOut(Schema):
    active_students: int
    top_students: List[TopStudentSchema]
    recent_tests: List[TestOut]
    question_counts: dict

class AnswerInSchema(Schema):
    question_id: uuid.UUID
    item_id: uuid.UUID

class AttemptInSchema(Schema):
    test_id: uuid.UUID
    answers: List[AnswerInSchema]

class AttemptOutSchema(Schema):
    id: uuid.UUID
    test_id: uuid.UUID
    test_title: str
    test_area: Optional[str]
    score_percentage: float
    correct_count: int
    total_count: int
    finished_at: Optional[str] = None
    
class TestStatsStudentSchema(Schema):
    email: str
    score_percentage: float
    status: str

class TestStatsOutSchema(Schema):
    test_id: uuid.UUID
    total_students: int
    completed_students: int
    students: List[TestStatsStudentSchema]

# --- Rotas de Questões ---

@router.post("/questions", response={201: QuestionOut})
def create_question(request, payload: QuestionIn):
    data = payload.dict(exclude={"items"})
    data["created_by"] = request.auth
    question = Question.objects.create(**data)
    
    # Criar items
    for item_data in payload.items:
        Item.objects.create(question=question, **item_data.dict())
        
    return 201, question

@router.get("/questions", response=List[QuestionOut])
def list_questions(request, subject: Optional[str] = None):
    # Professor vê as dele (ou todas se for banco global compartilhado)
    # Segundo DB_SPEC: "Repositório compartilhado entre professores."
    qs = Question.objects.all()
    if subject:
        qs = qs.filter(subject__iexact=subject)
    return qs

@router.get("/questions/{question_id}", response=QuestionOut)
def get_question(request, question_id: str):
    return get_object_or_404(Question, id=question_id)

@router.put("/questions/{question_id}", response={200: QuestionOut})
def update_question(request, question_id: str, payload: QuestionIn):
    if request.auth.role != 'PROFESSOR' and not request.auth.is_staff:
        return 401, {"detail": "Não autorizado"}
        
    question = get_object_or_404(Question, id=question_id)
    
    question.subject = payload.subject
    question.content = payload.content
    question.stem = payload.stem
    question.image_url = payload.image_url
    question.competence_bncc = payload.competence_bncc
    question.skill_bncc = payload.skill_bncc
    question.question_type = payload.question_type
    question.save()
    
    # Recreate items
    question.items.all().delete()
    for item_data in payload.items:
        Item.objects.create(question=question, **item_data.dict(exclude={'id'}))
        
    return 200, question

# --- Rotas de Simulados ---

@router.post("/tests", response={201: TestOut})
def create_test(request, payload: TestIn):
    data = payload.dict(exclude={"questions"})
    data["created_by"] = request.auth
    test = Test.objects.create(**data)
    
    for tq in payload.questions:
        question = get_object_or_404(Question, id=tq.question_id)
        TestQuestion.objects.create(
            test=test,
            question=question,
            order_index=tq.order_index,
            weight=tq.weight
        )
        
    return 201, test

@router.get("/tests", response=List[TestOut])
def list_tests(request):
    return Test.objects.all()

@router.get("/tests/assigned", response=List[TestOut])
def list_assigned_tests(request):
    # Filter JSON array in Django depends on DB. Since it's SQLite locally or Postgres, 
    # a simple python filter works for small scale or we can use JSONField lookups if Postgres.
    # For cross-compatibility, we can filter in python if DB JSON lookups fail, but let's try __contains.
    email = request.auth.email
    tests = Test.objects.all()
    assigned = []
    
    # Get tests already finished by this user
    finished_test_ids = TestAttempt.objects.filter(
        student=request.auth, 
        status='FINISHED'
    ).values_list('test_id', flat=True)

    for test in tests:
        if test.id in finished_test_ids:
            continue
            
        allowed = test.allowed_students or []
        if email in allowed:
            assigned.append(test)
    return assigned

@router.get("/tests/{test_id}", response=TestOut)
def get_test(request, test_id: str):
    return get_object_or_404(Test, id=test_id)

@router.get("/tests/{test_id}/full", response=FullTestSchema)
def get_full_test(request, test_id: str):
    test = get_object_or_404(Test, id=test_id)
    tqs = test.test_questions.select_related('question').all().order_by('order_index')
    questions = []
    for tq in tqs:
        q = tq.question
        items = list(q.items.all())
        questions.append({
            "id": q.id,
            "subject": q.subject,
            "stem": q.stem,
            "question_type": q.question_type,
            "items": items
        })
    return {
        "id": test.id,
        "title": test.title,
        "area": test.area,
        "time_per_question": test.time_per_question,
        "initial_seed": test.initial_seed,
        "questions": questions
    }

@router.get("/dashboard-stats", response=DashboardStatsOut)
def dashboard_stats(request):
    from accounts.models import User
    from .models import TestAttempt
    active_students = User.objects.filter(role='ALUNO', is_active=True).count()
    
    # Pegar simulados recentes (últimos 5)
    recent_tests = list(Test.objects.all().order_by('-start_at')[:5])
    
    # Top Students (Puxando a média do score_assigned em TestAttempts que estejam FINISHED)
    from django.db.models import Avg
    top_attempts = TestAttempt.objects.filter(status='FINISHED').values(
        'student__email'
    ).annotate(
        avg_score=Avg('responses__score_assigned')
    ).order_by('-avg_score')[:5]
    
    top_students = []
    for t in top_attempts:
        top_students.append({
            "email": t['student__email'],
            "score": float(t['avg_score'] or 0) * 100
        })
        
    # Contagem de questões por matéria
    qs_counts = Question.objects.values('subject').annotate(count=Count('id'))
    question_counts = {item['subject']: item['count'] for item in qs_counts}
        
    return {
        "active_students": active_students,
        "top_students": top_students,
        "recent_tests": recent_tests,
        "question_counts": question_counts
    }

@router.get("/tests/{test_id}", response=TestOut)
def get_test(request, test_id: str):
    return get_object_or_404(Test, id=test_id)

@router.post("/attempts", response={201: AttemptOutSchema, 400: dict})
def submit_attempt(request, payload: AttemptInSchema):
    student = request.auth
    test = get_object_or_404(Test, id=payload.test_id)
    
    # Create the attempt
    attempt = TestAttempt.objects.create(
        student=student,
        test=test,
        status='FINISHED'
    )
    
    correct_count = 0
    total_count = len(payload.answers)
    
    # Process answers
    for ans in payload.answers:
        question = get_object_or_404(Question, id=ans.question_id)
        item = get_object_or_404(Item, id=ans.item_id)
        
        is_correct = item.is_correct
        if is_correct:
            correct_count += 1
            
        StudentResponse.objects.create(
            attempt=attempt,
            question=question,
            selected_item=item,
            is_correct=is_correct,
            score_assigned=1.0 if is_correct else 0.0
        )
        
    score_percentage = (correct_count / total_count * 100) if total_count > 0 else 0
    
    from django.utils import timezone
    attempt.finished_at = timezone.now()
    attempt.save()
    
    return 201, {
        "id": attempt.id,
        "test_id": test.id,
        "test_title": test.title,
        "test_area": test.area,
        "score_percentage": score_percentage,
        "correct_count": correct_count,
        "total_count": total_count,
        "finished_at": attempt.finished_at.isoformat()
    }

@router.get("/attempts/my", response=List[AttemptOutSchema])
def list_my_attempts(request):
    attempts = TestAttempt.objects.filter(student=request.auth, status='FINISHED').order_by('-finished_at')
    result = []
    for att in attempts:
        total_qs = att.responses.count()
        correct_qs = att.responses.filter(is_correct=True).count()
        perc = (correct_qs / total_qs * 100) if total_qs > 0 else 0
        
        result.append({
            "id": att.id,
            "test_id": att.test_id,
            "test_title": att.test.title,
            "test_area": att.test.area,
            "score_percentage": perc,
            "correct_count": correct_qs,
            "total_count": total_qs,
            "finished_at": att.finished_at.isoformat() if att.finished_at else None
        })
    return result

@router.get("/tests/{test_id}/stats", response=TestStatsOutSchema)
def test_stats(request, test_id: uuid.UUID):
    if request.auth.role != 'PROFESSOR' and not request.auth.is_staff:
        return 401, {"detail": "Não autorizado"}
        
    test = get_object_or_404(Test, id=test_id)
    attempts = TestAttempt.objects.filter(test=test)
    
    students_list = []
    for att in attempts:
        total_qs = att.responses.count()
        correct_qs = att.responses.filter(is_correct=True).count()
        perc = (correct_qs / total_qs * 100) if total_qs > 0 else 0
        
        students_list.append({
            "email": att.student.email,
            "score_percentage": perc,
            "status": att.status
        })
        
    total_students = len(test.allowed_students) if test.allowed_students else 0
    
    return {
        "test_id": test.id,
        "total_students": total_students,
        "completed_students": attempts.filter(status='FINISHED').count(),
        "students": students_list
    }

@router.get("/students/{email}/attempts", response=List[AttemptOutSchema])
def student_attempts(request, email: str):
    if request.auth.role != 'PROFESSOR' and not request.auth.is_staff:
        return 401, {"detail": "Não autorizado"}
        
    attempts = TestAttempt.objects.filter(student__email=email, status='FINISHED').order_by('-finished_at')
    result = []
    for att in attempts:
        total_qs = att.responses.count()
        correct_qs = att.responses.filter(is_correct=True).count()
        perc = (correct_qs / total_qs * 100) if total_qs > 0 else 0
        
        result.append({
            "id": att.id,
            "test_id": att.test_id,
            "test_title": att.test.title,
            "test_area": att.test.area,
            "score_percentage": perc,
            "correct_count": correct_qs,
            "total_count": total_qs,
            "finished_at": att.finished_at.isoformat() if att.finished_at else None
        })
    return result
