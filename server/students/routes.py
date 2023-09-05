from flask import Blueprint, jsonify, request
from prisma.models import Student

students = Blueprint("students", __name__)


@students.route("", methods=["POST"])
def addStudent():
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

    return jsonify(
        {
            "message": "Student added successfully",
            # "data": student.to_dict(),
            "success": True,
        }
    )
