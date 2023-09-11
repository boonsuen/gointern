from flask import Blueprint, current_app, jsonify, make_response, request
from flask_jwt_extended import create_access_token
import jwt
import boto3
import prisma
from prisma.models import Student
from config import *

from auth_middleware import supervisor_token_required, student_token_required

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

        student = Student.prisma().find_unique(
            where={"email": email},
            include={"internship": {"include": {"company": True}}, "supervisor": True},
        )

        if student is None:
            return jsonify({"message": "Student not found", "success": False})

        if student.icNumber != icNumber:
            return jsonify({"message": "Invalid IC Number", "success": False})

        supervisor = None
        if student.supervisor is not None:
            supervisor = {
                "fullName": student.supervisor.fullName,
                "email": student.supervisor.email,
            }

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
                        "supervisor": supervisor,
                        "createdAt": student.createdAt.isoformat(),
                        "internship": internship,
                    },
                }
            ),
            200,
        )
        response.set_cookie(
            "access_token_student",
            access_token,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=60 * 60 * 24 * 7,
        )

        return response
    except Exception as e:
        return jsonify({"message": str(e), "success": False})


@students.route("/me", methods=["GET"])
def studentMe():
    try:
        token = request.cookies.get("access_token_student")
        if not token or token == "":
            return (
                jsonify({"message": "Student is not logged in", "success": False}),
                200,
            )

        decoded = jwt.decode(
            token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
        )
        user = Student.prisma().find_unique(
            where={"email": decoded["sub"]},
            include={"internship": {"include": {"company": True}}, "supervisor": True},
        )
        if user is None:
            return {
                "message": "Unauthorized student",
                "data": None,
                "success": False,
            }, 401

        supervisor = None
        if user.supervisor is not None:
            supervisor = {
                "email": user.supervisor.email,
                "fullName": user.supervisor.fullName,
            }

        internship = None
        if user.internship is not None:
            internship = {
                "id": user.internship.id,
                "status": user.internship.status,
                "company": {
                    "companyName": user.internship.company.companyName,
                    "email": user.internship.company.email,
                },
                "startDate": user.internship.startDate.isoformat(),
                "endDate": user.internship.endDate.isoformat(),
                "allowance": user.internship.allowance,
                "createdAt": user.internship.createdAt.isoformat(),
                "comSupervisorName": user.internship.comSupervisorName,
                "comSupervisorEmail": user.internship.comSupervisorEmail,
            }

        return jsonify(
            {
                "message": "Authorized student",
                "success": True,
                "data": {
                    "studentId": user.studentId,
                    "fullName": user.fullName,
                    "email": user.email,
                    "icNumber": user.icNumber,
                    "supervisor": supervisor,
                    "createdAt": user.createdAt.isoformat(),
                    "internship": internship,
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
            "access_token_student",
            "",
            httponly=True,
            secure=True,
            samesite="None",
            max_age=0,
        )

        return response
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@students.route("", methods=["GET"])
@supervisor_token_required
def getStudents(user):
    try:
        students = Student.prisma().find_many(order={"createdAt": "desc"})
        return jsonify(
            {
                "message": "Students fetched successfully",
                "success": True,
                "data": [
                    {
                        "studentId": student.studentId,
                        "fullName": student.fullName,
                        "email": student.email,
                        "icNumber": student.icNumber,
                        "createdAt": student.createdAt.isoformat(),
                    }
                    for student in students
                ],
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@students.route("/submit-internship", methods=["POST"])
@student_token_required
def submitInternship(user):
    try:
        data = request.json

        if data is None:
            return

        startDate = data.get("startDate")
        endDate = data.get("endDate")
        companyEmail = data.get("companyEmail")
        allowance = data.get("allowance")
        comSupervisorName = data.get("comSupervisorName")
        comSupervisorEmail = data.get("comSupervisorEmail")

        if (
            startDate is None
            or endDate is None
            or companyEmail is None
            or allowance is None
            or comSupervisorName is None
            or comSupervisorEmail is None
        ):
            return {"message": "Missing required fields", "success": False}

        student = Student.prisma().find_unique(
            where={"email": user.email},
            include={"internship": {"include": {"company": True}}, "supervisor": True},
        )

        if student is None:
            return {"message": "Student not found", "success": False}

        # If student has not yet submitted internship
        if student.internship is None:
            student = Student.prisma().update(
                where={"email": user.email},
                data={
                    "internship": {
                        "create": {
                            "startDate": startDate,
                            "endDate": endDate,
                            "allowance": allowance,
                            "company": {"connect": {"email": companyEmail}},
                            "comSupervisorName": comSupervisorName,
                            "comSupervisorEmail": comSupervisorEmail,
                        }
                    },
                },
            )
        else:
            # Else, update the existing internship
            student = Student.prisma().update(
                where={"email": user.email},
                data={
                    "internship": {
                        "update": {
                            "startDate": startDate,
                            "endDate": endDate,
                            "allowance": allowance,
                            "company": {"connect": {"email": companyEmail}},
                            "comSupervisorName": comSupervisorName,
                            "comSupervisorEmail": comSupervisorEmail,
                            "status": "SUBMITTED",
                        }
                    },
                },
            )

        return jsonify(
            {
                "message": "Internship submitted successfully",
                "success": True,
            }
        )

    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@students.route("/progress-report", methods=["POST"])
@student_token_required
def uploadProgressReport(user):
    try:
        progress_report_file = request.files["progressReportFile"]

        if progress_report_file is None or progress_report_file.filename == "":
            return {"message": "Please select a file", "success": False}

        student = Student.prisma().find_unique(
            where={"email": user.email},
            include={"internship": {"include": {"company": True}}, "supervisor": True},
        )

        if student is None:
            return {"message": "Student not found", "success": False}

        # Get file extension
        file_extension = progress_report_file.filename.split(".")[-1]

        progress_report_file_name_in_s3 = (
            "progress-report-" + student.studentId + "." + file_extension
        )

        # Upload file to S3
        s3 = boto3.resource("s3")
        s3.Bucket(custom_bucket).put_object(
            Key="progress-reports/" + progress_report_file_name_in_s3,
            Body=progress_report_file,
        )
        bucket_location = boto3.client("s3").get_bucket_location(Bucket=custom_bucket)
        s3_location = bucket_location["LocationConstraint"]
        if s3_location is None:
            s3_location = ""
        else:
            s3_location = "-" + s3_location

        object_url = "https://s3{0}.amazonaws.com/{1}/{2}".format(
            s3_location, custom_bucket, progress_report_file_name_in_s3
        )

        # Generate presigned URL
        presigned_url = s3.meta.client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": custom_bucket,
                "Key": "progress-reports/" + progress_report_file_name_in_s3,
            },
            ExpiresIn=3600,
        )

        # Get uploadedAt
        uploadedAt = s3.Bucket(custom_bucket).Object(
            "progress-reports/progress-report-" + student.studentId + ".pdf"
        ).last_modified

        return jsonify(
            {
                "message": "Progress report uploaded successfully",
                "success": True,
                "data": {
                    "downloadUrl": presigned_url,
                    "uploadedAt": uploadedAt,
                },
            }
        )

    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@students.route("/progress-report", methods=["GET"])
@student_token_required
def getProgressReport(user):
    try:
        student = Student.prisma().find_unique(
            where={"email": user.email},
            include={"internship": {"include": {"company": True}}, "supervisor": True},
        )

        if student is None:
            return {"message": "Student not found", "success": False}

        if student.internship is None:
            return {"message": "Student has not submitted internship", "success": False}

        # Check S3 if file exists using head_object
        s3 = boto3.resource("s3")
        bucket = s3.Bucket(custom_bucket)
        file_exists = True
        try:
            bucket.Object(
                "progress-reports/progress-report-" + student.studentId + ".pdf"
            ).load()
        except:
            file_exists = False

        if not file_exists:
            return jsonify(
                {
                    "message": "Progress report not found",
                    "success": True,
                    "data": {
                        "downloadUrl": None,
                        "uploadedAt": None,
                    },
                }
            )

        # Generate presigned URL
        presigned_url = s3.meta.client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": custom_bucket,
                "Key": "progress-reports/progress-report-" + student.studentId + ".pdf",
            },
            ExpiresIn=3600,
        )

        # Get uploadedAt
        uploadedAt = bucket.Object(
            "progress-reports/progress-report-" + student.studentId + ".pdf"
        ).last_modified

        return jsonify(
            {
                "message": "Progress report fetched successfully",
                "success": True,
                "data": {
                    "downloadUrl": presigned_url,
                    "uploadedAt": uploadedAt,
                },
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500
