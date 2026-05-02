from ninja import Router
from ninja.security import HttpBearer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from ninja import Schema
from django.shortcuts import get_object_or_404

router = Router()

class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        from rest_framework_simplejwt.authentication import JWTAuthentication
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        
        jwt_auth = JWTAuthentication()
        try:
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            return user
        except (InvalidToken, TokenError):
            return None

class LoginSchema(Schema):
    email: str
    password: str

class RegisterSchema(Schema):
    email: str
    password: str
    role: str = "PROFESSOR"
    phone: str = None

class TokenSchema(Schema):
    access: str
    refresh: str
    
class UserSchema(Schema):
    id: str
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
