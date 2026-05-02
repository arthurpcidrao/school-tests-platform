from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, LoginSerializer, RegisterSerializer

class RegisterView(generics.CreateAPIView):
    """Endpoint para registro de novos usuários"""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class LoginView(generics.GenericAPIView):
    """Endpoint para login de usuários"""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })

class UserProfileView(generics.RetrieveUpdateAPIView):
    """Endpoint para visualizar e atualizar perfil do usuário"""
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user
    
    def put(self, request, *args, **kwargs):
        response = self.partial_update(request, *args, **kwargs)
        response['user'] = self.get_serializer(self.request.user).data
        return response
