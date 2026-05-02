from typing import List, Optional
from ninja import Router, Schema
from django.shortcuts import get_object_or_404
from .models import Question, Item, Test, TestQuestion
from accounts.api import AuthBearer

router = Router(auth=AuthBearer())

# Schemas para Question
class ItemSchema(Schema):
    id: str = None
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
    id: str
    subject: str
    content: str
    stem: str
    image_url: Optional[str] = None
    question_type: str
    items: List[ItemSchema]

# Schemas para Test
class TestQuestionSchema(Schema):
    question_id: str
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
    id: str
    title: str
    area: Optional[str] = None

# --- Rotas de Questões ---

@router.post("/questions", response={201: QuestionOut})
def create_question(request, payload: QuestionIn):
    data = payload.dict(exclude={"items"})
    data["created_by"] = request.auth
    question = Question.objects.create(**data)
    
    # Criar items
    for item_data in payload.items:
        Item.objects.create(question=question, **item_data)
        
    return 201, question

@router.get("/questions", response=List[QuestionOut])
def list_questions(request):
    # Professor vê as dele (ou todas se for banco global compartilhado)
    # Segundo DB_SPEC: "Repositório compartilhado entre professores."
    return Question.objects.all()

@router.get("/questions/{question_id}", response=QuestionOut)
def get_question(request, question_id: str):
    return get_object_or_404(Question, id=question_id)

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
    if request.auth.role == 'PROFESSOR':
        return Test.objects.filter(created_by=request.auth)
    return Test.objects.all() # Aluno veria os disponíveis aqui (filtrado futuramente)

@router.get("/tests/{test_id}", response=TestOut)
def get_test(request, test_id: str):
    return get_object_or_404(Test, id=test_id)
