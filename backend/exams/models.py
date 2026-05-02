import uuid
from django.db import models
from accounts.models import User

class Question(models.Model):
    QUESTION_TYPES = (
        ('ABERTA', 'Aberta'),
        ('FECHADA', 'Fechada'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    stem = models.TextField()
    image_url = models.CharField(max_length=500, blank=True, null=True)
    competence_bncc = models.CharField(max_length=100, blank=True, null=True)
    skill_bncc = models.CharField(max_length=100, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='FECHADA')

    def __str__(self):
        return f"{self.subject} - {str(self.id)[:8]}"

    class Meta:
        db_table = 'questions'

class Item(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='items')
    text = models.TextField()
    image_url = models.CharField(max_length=500, blank=True, null=True)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"Item for Question {self.question_id}"

    class Meta:
        db_table = 'items'

class Test(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    area = models.CharField(max_length=255, blank=True, null=True)
    start_at = models.DateTimeField(blank=True, null=True)
    end_at = models.DateTimeField(blank=True, null=True)
    time_per_question = models.IntegerField(blank=True, null=True, help_text="Tempo em segundos")
    allowed_students = models.JSONField(blank=True, null=True, help_text="Lista de emails autorizados")
    initial_seed = models.IntegerField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tests', null=True, blank=True)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'tests'

class TestQuestion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='test_questions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='test_questions')
    order_index = models.IntegerField(default=0)
    weight = models.FloatField(default=1.0)

    class Meta:
        db_table = 'test_questions'
        ordering = ['order_index']

class TestAttempt(models.Model):
    STATUS_CHOICES = (
        ('IN_PROGRESS', 'Em Andamento'),
        ('FINISHED', 'Finalizado'),
        ('EXPIRED', 'Expirado'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attempts')
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='attempts')
    start_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_PROGRESS')
    random_seed = models.IntegerField(blank=True, null=True)

    class Meta:
        db_table = 'test_attempts'

class StudentResponse(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attempt = models.ForeignKey(TestAttempt, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='student_responses')
    text_response = models.TextField(blank=True, null=True)
    selected_item = models.ForeignKey(Item, on_delete=models.SET_NULL, blank=True, null=True, related_name='student_responses')
    is_correct = models.BooleanField(blank=True, null=True)
    score_assigned = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    class Meta:
        db_table = 'student_responses'
