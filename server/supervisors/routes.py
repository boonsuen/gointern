from flask import Blueprint, current_app, jsonify, make_response, request
from flask_jwt_extended import create_access_token, unset_jwt_cookies
import jwt
import prisma
import boto3
from config import *
from prisma.models import Supervisor, Student

from auth_middleware import admin_token_required, supervisor_token_required

supervisors = Blueprint("supervisors", __name__)


@supervisors.route("/signup", methods=["POST"])
def supervisorSignUp():
    try:
        data = request.json

        if data is None:
            return

        email = data.get("email")
        fullName = data.get("fullName")
        password = data.get("password")

        if email is None or fullName is None or password is None:
            return {"message": "Missing required fields", "success": False}

        supervisor = Supervisor.prisma().create(
            data={
                "email": email,
                "fullName": fullName,
                "password": password,
            }
        )

        return jsonify(
            {
                "message": "Supervisor added successfully",
                "success": True,
            }
        )
    except prisma.errors.UniqueViolationError:
        return jsonify({"message": "Supervisor already exists", "success": False})
    except Exception as e:
        return jsonify({"message": str(e), "success": False})


@supervisors.route("/login", methods=["POST"])
def supervisorLogin():
    try:
        data = request.json

        if data is None:
            return

        email = data.get("email")
        password = data.get("password")

        if email is None or password is None:
            return {"message": "Missing required fields", "success": False}

        supervisor = Supervisor.prisma().find_unique(where={"email": email})

        if supervisor is None:
            return jsonify({"message": "Supervisor not found", "success": False})

        if supervisor.password != password:
            return jsonify({"message": "Wrong password", "success": False})

        # Create access token
        access_token = create_access_token(identity=supervisor.email)
        response = make_response(
            jsonify(
                {
                    "access_token": access_token,
                    "success": True,
                    "message": "Supervisor logged in successfully",
                    "data": {
                        "email": supervisor.email,
                        "fullName": supervisor.fullName,
                        "isApproved": supervisor.isApproved,
                    },
                }
            ),
            200,
        )
        response.set_cookie(
            "access_token_supervisor",
            access_token,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=60 * 60 * 24 * 7,
        )

        return response
    except Exception as e:
        return jsonify({"message": str(e), "success": False})


@supervisors.route("/me", methods=["GET"])
def supervisorMe():
    try:
        token = request.cookies.get("access_token_supervisor")
        if not token or token == "":
            return (
                jsonify({"message": "Supervisor is not logged in", "success": False}),
                200,
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

        return jsonify(
            {
                "message": "Authorized supervisor",
                "success": True,
                "data": {
                    "email": user.email,
                    "fullName": user.fullName,
                    "isApproved": user.isApproved,
                },
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@supervisors.route("/logout", methods=["POST"])
def supervisorLogout():
    try:
        response = make_response(
            jsonify(
                {
                    "message": "Supervisor logged out successfully",
                    "success": True,
                }
            ),
            200,
        )
        response.set_cookie(
            "access_token_supervisor",
            "",
            httponly=True,
            secure=True,
            samesite="None",
            max_age=0,
        )

        return response
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@supervisors.route("", methods=["GET"])
@admin_token_required
def getSupervisors(user):
    try:
        supervisors = Supervisor.prisma().find_many(order={"createdAt": "desc"})
        return jsonify(
            {
                "message": "Supervisors fetched successfully",
                "data": [
                    {
                        "email": supervisor.email,
                        "fullName": supervisor.fullName,
                        "isApproved": supervisor.isApproved,
                        "createdAt": supervisor.createdAt.isoformat(),
                    }
                    for supervisor in supervisors
                ],
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@supervisors.route("/approve", methods=["POST"])
@admin_token_required
def approveSupervisor(user):
    try:
        data = request.json

        if data is None:
            return

        email = data.get("email")

        if email is None:
            return {"message": "Missing required fields", "success": False}

        supervisor = Supervisor.prisma().update(
            where={"email": email},
            data={
                "isApproved": True,
            },
        )

        return jsonify(
            {
                "message": "Supervisor approved successfully",
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@supervisors.route("/assign-student", methods=["POST"])
@supervisor_token_required
def assignStudent(user):
    try:
        data = request.json

        if data is None:
            return

        studentId = data.get("studentId")

        if studentId is None:
            return {"message": "Missing required fields", "success": False}

        if (
            Student.prisma()
            .find_unique(where={"studentId": studentId}, include={"supervisor": True})
            .supervisor
            is not None
        ):
            return {
                "message": "Student is already assigned to a supervisor",
                "success": False,
            }

        student = Student.prisma().update(
            where={"studentId": studentId},
            data={"supervisor": {"connect": {"email": user.email}}},
        )

        return jsonify(
            {
                "message": "Student assigned successfully",
                "success": True,
                "data": {
                    "studentId": student.studentId,
                    "email": student.email,
                    "fullName": student.fullName,
                    "icNumber": student.icNumber,
                },
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@supervisors.route("/my-students", methods=["GET"])
@supervisor_token_required
def getMyStudents(user):
    try:
        students = Student.prisma().find_many(
            where={"supervisorEmail": user.email},
            include={"supervisor": True, "internship": {"include": {"company": True}}},
        )

        # Initialize an empty list to store student data
        student_data = []

        # Check S3 if file exists using head_object and generate presigned URL
        s3 = boto3.client("s3")
        for student in students:
            file_exists = True
            try:
                s3.head_object(
                    Bucket=custom_bucket,
                    Key=f"progress-reports/progress-report-{student.studentId}.pdf",
                )
            except:
                file_exists = False

            if not file_exists:
                downloadUrl = None
            else:
                # Generate presigned URL
                presigned_url = s3.generate_presigned_url(
                    "get_object",
                    Params={
                        "Bucket": custom_bucket,
                        "Key": f"progress-reports/progress-report-{student.studentId}.pdf",
                    },
                    ExpiresIn=3600,
                )
                downloadUrl = presigned_url

            internship = None
            if student.internship is not None:
                internship = {
                    "id": student.internship.id,
                    "status": student.internship.status,
                    "company": {
                        "companyName": student.internship.company.companyName,
                        "email": student.internship.company.email,
                    },
                    "startDate": student.internship.startDate.isoformat(),
                    "endDate": student.internship.endDate.isoformat(),
                    "allowance": student.internship.allowance,
                    "createdAt": student.internship.createdAt.isoformat(),
                    "comSupervisorName": student.internship.comSupervisorName,
                    "comSupervisorEmail": student.internship.comSupervisorEmail,
                }

            student_data.append(
                {
                    "studentId": student.studentId,
                    "email": student.email,
                    "fullName": student.fullName,
                    "icNumber": student.icNumber,
                    "supervisor": {
                        "email": student.supervisor.email,
                        "fullName": student.supervisor.fullName,
                    },
                    "internship": internship,
                    "downloadUrl": downloadUrl,
                }
            )

        return jsonify(
            {
                "message": "Students fetched successfully",
                "data": student_data,
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500
