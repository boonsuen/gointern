from functools import wraps
import jwt
from flask import request
from flask import current_app
from prisma.models import Admin, Supervisor, Student, Company


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


def supervisor_token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            token = request.cookies.get("access_token_supervisor")
            if not token or token == "":
                return (
                    {
                        "message": "Supervisor is not logged in",
                        "success": False,
                        "error": "Unauthorized",
                    },
                    401,
                )

            decoded = jwt.decode(
                token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
            )
            user = Supervisor.prisma().find_unique(where={"email": decoded["sub"]})
            if user is None:
                return {
                    "message": "Unauthorized supervisor",
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


def student_token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            token = request.cookies.get("access_token_student")
            if not token or token == "":
                return (
                    {
                        "message": "Student is not logged in",
                        "success": False,
                        "error": "Unauthorized",
                    },
                    401,
                )

            decoded = jwt.decode(
                token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
            )
            user = Student.prisma().find_unique(
                where={"email": decoded["sub"]}, include={"supervisor": True}
            )
            if user is None:
                return {
                    "message": "Unauthorized student",
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

def company_token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            token = request.cookies.get("access_token_company")
            if not token or token == "":
                return (
                    {
                        "message": "Company is not logged in",
                        "success": False,
                        "error": "Unauthorized",
                    },
                    401,
                )

            decoded = jwt.decode(
                token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
            )
            user = Company.prisma().find_unique(
                where={"email": decoded["sub"]}
            )
            if user is None:
                return {
                    "message": "Unauthorized company",
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