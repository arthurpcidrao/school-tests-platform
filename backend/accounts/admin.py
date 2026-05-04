from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Remove a dependência do 'username' que não existe no nosso modelo
    list_display = ['email', 'role', 'phone', 'is_staff']
    ordering = ['email']
    search_fields = ['email', 'phone']

    # Redefine completamente a tela de edição para mostrar os nossos campos
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informações Adicionais', {'fields': ('role', 'phone', 'auth_provider')}),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas Importantes', {'fields': ('last_login', 'date_joined')}),
    )

    # Redefine a tela de criação (Add User) que o UserAdmin usa
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'role', 'phone'),
        }),
    )