import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import RequestFactory
from accounts.models import User
from ninja_jwt.tokens import RefreshToken
from ninja_jwt.authentication import JWTAuth

# Create a dummy user
user, _ = User.objects.get_or_create(email="test@test.com")
user.set_password("123")
user.save()

# Generate token
refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)

# Simulate Request
rf = RequestFactory()
request = rf.post('/api/exams/questions', HTTP_AUTHORIZATION=f"Bearer {access_token}")

auth = JWTAuth()
try:
    auth_user = auth(request)
    print("SUCCESS, auth_user:", auth_user)
except Exception as e:
    print("ERROR:", str(e), type(e))
