import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from ninja_jwt.tokens import RefreshToken
from accounts.models import User
import requests

user = User.objects.get(email="arthurpcidrao@gmail.com")
refresh = RefreshToken.for_user(user)
token = str(refresh.access_token)

response = requests.get("http://localhost:8000/api/auth/students", headers={"Authorization": f"Bearer {token}"})
print("STATUS CODE:", response.status_code)
print("RESPONSE:", response.text)
