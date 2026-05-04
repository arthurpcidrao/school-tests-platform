from ninja import Router
from ninja.security import HttpBearer
from django.contrib.auth import authenticate
from ninja_jwt.tokens import RefreshToken
from ninja_jwt.authentication import JWTAuth
from .models import User
from ninja import Schema
from django.shortcuts import get_object_or_404
from google.oauth2 import id_token
from google.auth.transport import requests
import os

router = Router()

# Usamos JWTAuth diretamente
AuthBearer = JWTAuth

class LoginSchema(Schema):
    email: str
    password: str

class RegisterSchema(Schema):
    email: str
    password: str
    role: str = "PROFESSOR"
    phone: str = None

class GoogleLoginSchema(Schema):
    id_token: str
    role: str = "ALUNO" # Default to ALUNO, can be PROFESSOR

class TokenSchema(Schema):
    access: str
    refresh: str
    
import uuid

class UserSchema(Schema):
    id: uuid.UUID
    email: str
    role: str

@router.post("/login", response={200: TokenSchema, 401: dict})
def login(request, data: LoginSchema):
    user = authenticate(email=data.email, password=data.password)
    if user:
        refresh = RefreshToken.for_user(user)
        return 200, {
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }
    return 401, {"detail": "Credenciais inválidas"}

@router.post("/google-login", response={200: TokenSchema, 401: dict, 400: dict})
def google_login(request, data: GoogleLoginSchema):
    try:
        # Pega o Client ID da variável de ambiente, ou permite um bypass em dev caso seja vazio
        client_id = os.environ.get("GOOGLE_CLIENT_ID")
        
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(data.id_token, requests.Request(), client_id)
        email = idinfo.get("email")
        
        if not email:
            return 400, {"detail": "Email não fornecido pelo Google"}
            
        # Verifica se o usuário existe
        try:
            user = User.objects.get(email=email)
            refresh = RefreshToken.for_user(user)
            return 200, {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }
        except User.DoesNotExist:
            return 401, {"detail": "Usuário não encontrado. Por favor, faça o cadastro primeiro."}
            
    except ValueError as e:
        return 401, {"detail": "Token do Google inválido"}
    except Exception as e:
        return 400, {"detail": f"Erro na autenticação: {str(e)}"}

@router.post("/google-register", response={201: TokenSchema, 400: dict})
def google_register(request, data: GoogleLoginSchema):
    try:
        client_id = os.environ.get("GOOGLE_CLIENT_ID")
        idinfo = id_token.verify_oauth2_token(data.id_token, requests.Request(), client_id)
        email = idinfo.get("email")
        
        if not email:
            return 400, {"detail": "Email não fornecido pelo Google"}
            
        if User.objects.filter(email=email).exists():
            return 400, {"detail": "Email já cadastrado. Faça login."}
            
        user = User.objects.create_user(
            email=email,
            role=data.role,
            auth_provider='google'
        )
        
        refresh = RefreshToken.for_user(user)
        return 201, {
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }
        
    except ValueError as e:
        return 401, {"detail": "Token do Google inválido"}
    except Exception as e:
        return 400, {"detail": f"Erro no cadastro: {str(e)}"}

@router.post("/register", response={201: UserSchema, 400: dict})
def register(request, data: RegisterSchema):
    if User.objects.filter(email=data.email).exists():
        return 400, {"detail": "Email já cadastrado"}
    
    user = User.objects.create_user(
        email=data.email,
        password=data.password,
        role=data.role,
        phone=data.phone
    )
    return 201, {
        "id": str(user.id),
        "email": user.email,
        "role": user.role
    }

@router.get("/me", response={200: UserSchema}, auth=AuthBearer())
def me(request):
    return 200, {
        "id": str(request.auth.id),
        "email": request.auth.email,
        "role": request.auth.role
    }

from typing import List
@router.get("/students", auth=AuthBearer(), response={200: List[UserSchema], 401: dict})
def list_students(request):
    if request.auth.role != 'PROFESSOR' and not request.auth.is_staff:
        return 401, {"detail": "Acesso não autorizado"}
        
    students = User.objects.filter(role='ALUNO').order_by('email')
    return 200, students
