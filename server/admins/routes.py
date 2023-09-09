from flask import Blueprint, current_app, jsonify, make_response, request
from flask_jwt_extended import create_access_token, unset_jwt_cookies
import jwt
import prisma
from prisma.models import Admin

admins = Blueprint("admins", __name__)


@admins.route("/login", methods=["POST"])
def adminLogin():
    try:
        data = request.json

        if data is None:
            return

        email = data.get("email")
        password = data.get("password")

        if email is None or password is None:
            return {"message": "Missing required fields", "success": False}

        admin = Admin.prisma().find_unique(where={"email": email})

        if admin is None or admin.password != password:
            return {"message": "Invalid email or password", "success": False}

        # Create access token
        access_token = create_access_token(identity=admin.email)
        response = make_response(
            jsonify(
                {
                    "access_token": access_token,
                    "success": True,
                    "message": "Admin logged in successfully",
                    "data": {
                        "email": admin.email,
                    },
                }
            ),
            200,
        )
        response.set_cookie(
            "access_token_admin",
            access_token,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=60 * 60 * 24 * 7,
        )

        return response
    except Exception as e:
        return jsonify({"message": str(e), "success": False})


@admins.route("/me", methods=["GET"])
def adminMe():
    try:
        token = request.cookies.get("access_token_admin")
        if not token or token == "":
            return (
                jsonify({"message": "Admin is not logged in", "success": False}),
                200,
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

        return jsonify(
            {
                "message": "Authorized admin",
                "success": True,
                "data": {
                    "email": user.email,
                },
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@admins.route("/logout", methods=["POST"])
def adminLogout():
    try:
        response = make_response(
            jsonify(
                {
                    "message": "Admin logged out successfully",
                    "success": True,
                }
            ),
            200,
        )
        response.set_cookie(
            "access_token_admin",
            "",
            httponly=True,
            secure=True,
            samesite="None",
            max_age=0,
        )

        return response
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500
