from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .database import get_supabase

bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class CurrentUser:
    id: str
    role: str
    email: str | None
    name: str | None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> CurrentUser:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")

    try:
        auth_user = get_supabase().auth.get_user(credentials.credentials).user
        if not auth_user:
            raise ValueError("Invalid user")
        profile = (
            get_supabase()
            .table("profiles")
            .select("id, role, email, name")
            .eq("id", auth_user.id)
            .single()
            .execute()
        ).data
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc

    if not profile or profile.get("role") not in {"student", "admin"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Profile role is not authorized")

    return CurrentUser(
        id=profile["id"],
        role=profile["role"],
        email=profile.get("email"),
        name=profile.get("name"),
    )


def require_admin(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Administrator access required")
    return user
