import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from .config import get_settings
from .routes import assistant, attendance, complaints, insights, mess, notifications

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("campuspulse-ai")
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("CampusPulse AI service started")
    yield
    logger.info("CampusPulse AI service stopped")


app = FastAPI(title="CampusPulse AI Automation Service", version="1.0.0", lifespan=lifespan)
settings = get_settings()
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(_: Request, __: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})


@app.get("/health")
def health():
    return {"status": "ok", "service": "campuspulse-ai"}


app.include_router(attendance.router, prefix="/api")
app.include_router(complaints.router, prefix="/api")
app.include_router(mess.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(assistant.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
