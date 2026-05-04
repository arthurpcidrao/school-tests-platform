from django.contrib import admin
from .models import Question, Test

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['subject', 'stem', 'created_by']
    search_fields = ['subject', 'stem']

@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ['title', 'start_at', 'end_at']
    list_filter = ['start_at']