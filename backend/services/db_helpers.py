from typing import Any

from ..database import get_supabase


def _query(table: str):
    return get_supabase().table(table)


async def select_rows(table: str, columns: str = "*") -> list[dict[str, Any]]:
    return (_query(table).select(columns).execute()).data or []


async def insert_one(table: str, payload: dict[str, Any]) -> dict[str, Any]:
    result = _query(table).insert(payload).execute()
    return (result.data or [{}])[0]


async def upsert_one(table: str, payload: dict[str, Any]) -> dict[str, Any]:
    result = _query(table).upsert(payload).execute()
    return (result.data or [{}])[0]


def filtered_query(table: str, columns: str = "*"):
    return _query(table).select(columns)
