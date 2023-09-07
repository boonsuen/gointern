from flask import Blueprint, current_app, jsonify, make_response, request
from flask_jwt_extended import create_access_token, unset_jwt_cookies
import jwt
import prisma
from prisma.models import Student

students = Blueprint("students", __name__)


@students.route("/signup", methods=["POST"])
def studentSignUp():
    try:
        data = request.json

        if data is None:
            return

        studentId = data.get("studentId")
        email = data.get("email")
        fullName = data.get("fullName")
        icNumber = data.get("icNumber")

        if studentId is None or fullName is None or email is None or icNumber is None:
            return {"message": "Missing required fields", "success": False}

        student = Student.prisma().create(
            data={
                "studentId": studentId,
                "fullName": fullName,
                "email": email,
                "icNumber": icNumber,
            }
        )

        print(student)

        return jsonify(
            {
                "message": "Student added successfully",
                "success": True,
            }
        )
    except prisma.errors.UniqueViolationError:
        return jsonify({"message": "Student already exists", "success": False})
    except Exception as e:
        return jsonify({"message": str(e), "success": False})


@students.route("/login", methods=["POST"])
def studentLogin():
    try:
        data = request.json

        if data is None:
            return

        email = data.get("email")
        icNumber = data.get("icNumber")

        if email is None or icNumber is None:
            return {"message": "Missing required fields", "success": False}

        student = Student.prisma().find_unique(where={"email": email})

        if student is None:
            return jsonify({"message": "Student not found", "success": False})

        if student.icNumber != icNumber:
            return jsonify({"message": "Invalid IC Number", "success": False})

        # Create access token
        access_token = create_access_token(identity=student.email, expires_delta=False)
        response = make_response(
            jsonify(
                {
                    "access_token": access_token,
                    "success": True,
                    "message": "Student logged in successfully",
                    "data": {
                        "studentId": student.studentId,
                        "fullName": student.fullName,
                        "email": student.email,
                        "icNumber": student.icNumber,
                    },
                }
            ),
            200,
        )
        response.set_cookie(
            "access_token_cookie_student",
            access_token,
            httponly=True,
            max_age=60 * 60 * 24 * 7,
        )

        return response
    except Exception as e:
        return jsonify({"message": str(e), "success": False})


@students.route("/me", methods=["POST"])
def studentMe():
    try:
        token = request.cookies.get("access_token_cookie_student")
        if not token or token == "":
            return (
                jsonify({"message": "Student is not logged in", "success": False}),
                200,
            )

        print(type(token))

        decoded = jwt.decode(
            token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
        )
        user = Student.prisma().find_unique(where={"email": decoded["sub"]})
        if user is None:
            return {
                "message": "Unauthorized student",
                "data": None,
                "success": False,
            }, 401

        return jsonify(
            {
                "message": "Authorized student",
                "success": True,
                "data": {
                    "studentId": user.studentId,
                    "fullName": user.fullName,
                    "email": user.email,
                    "icNumber": user.icNumber,
                },
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@students.route("/logout", methods=["POST"])
def studentLogout():
    try:
        response = make_response(
            jsonify(
                {
                    "message": "Student logged out successfully",
                    "success": True,
                }
            ),
            200,
        )
        response.set_cookie(
            "access_token_cookie_student",
            "",
            httponly=True,
            max_age=0,
        )

        return response
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500
