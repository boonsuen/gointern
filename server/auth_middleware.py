from functools import wraps
import jwt
from flask import request
from flask import current_app
from prisma.models import Admin


def admin_token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            token = request.cookies.get("access_token_admin")
            if not token or token == "":
                return (
                    {
                        "message": "Admin is not logged in",
                        "success": False,
                        "error": "Unauthorized",
                    },
                    401,
                )

            decoded = jwt.decode(
                token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
            )
            user = Admin.prisma().find_unique(where={"email": decoded["sub"]})
            if user is None:
                return {
                    "message": "Unauthorized admin",
                    "data": None,
                    "success": False,
                }, 401
        except Exception as e:
            return {
                "message": "Something went wrong",
                "data": None,
                "error": str(e),
            }, 500

        return f(user, *args, **kwargs)

    return decorated
