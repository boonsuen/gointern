import json
from flask import Blueprint, jsonify, request
import prisma
from prisma.models import Student

students = Blueprint("students", __name__)


@students.route("", methods=["POST"])
def addStudent():
    try:
        data = request.json

        if data is None:
            return

        studentId = data.get("studentId")
        fullName = data.get("fullName")
        email = data.get("email")

        if studentId is None or fullName is None or email is None:
            return {"message": "Missing required fields", "success": False}

        student = Student.prisma().create(
            data={"studentId": studentId, "fullName": fullName, "email": email}
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
