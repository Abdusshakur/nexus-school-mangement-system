"""Canonical permission names used by the application.

Routers intentionally keep using readable literal strings. This registry is
used to validate those strings and to synchronize the database through
Alembic, rather than introducing a second constants API.
"""

SYSTEM_PERMISSIONS: frozenset[str] = frozenset({
    "admin:read",
    "admin:write",
    "announcement:delete",
    "announcement:read",
    "announcement:write",
    "attendance:approve",
    "attendance:read",
    "attendance:write",
    "calendar:read",
    "calendar:write",
    "class:read",
    "class:write",
    "dashboard:read",
    "global_template:manage",
    "parent:read",
    "parent:write",
    "relationship:write",
    "result:approve",
    "result:publish",
    "result:read",
    "result:write",
    "student:read",
    "student:write",
    "subject:read",
    "subject:write",
    "teacher:read",
    "teacher:write",
    "timetable:read",
    "timetable:write",
})


def validate_permission_name(permission_name: str) -> str:
    """Fail fast when a router references an unregistered permission."""
    if permission_name not in SYSTEM_PERMISSIONS:
        raise ValueError(
            f"Unknown permission '{permission_name}'. Add it to "
            "backend/app/core/permissions.py and an Alembic migration."
        )
    return permission_name
