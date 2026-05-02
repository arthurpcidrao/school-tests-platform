from ninja import NinjaAPI
from accounts.api import router as accounts_router
from exams.api import router as exams_router

api = NinjaAPI(title="EdukSim API")

api.add_router("/auth/", accounts_router)
api.add_router("/exams/", exams_router)
