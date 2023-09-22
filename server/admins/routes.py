from flask import Blueprint, current_app, jsonify, make_response, request
from flask_jwt_extended import create_access_token, unset_jwt_cookies
import jwt
import prisma
from prisma.models import Admin, Student, Internship, Company, Announcement

from auth_middleware import admin_token_required

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


@admins.route("/students", methods=["GET"])
@admin_token_required
def getStudents(user):
    try:
        students = Student.prisma().find_many(
            where={"internship": {"isNot": None}, "supervisor": {"isNot": None}},
            include={"internship": {"include": {"company": True}}, "supervisor": True},
            order={"internship": {"createdAt": "desc"}},
        )
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
                        "supervisor": {
                            "fullName": student.supervisor.fullName,
                            "email": student.supervisor.email,
                        },
                        "internship": {
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
                        },
                    }
                    for student in students
                ],
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@admins.route("/students/approve", methods=["POST"])
@admin_token_required
def approveInternship(user):
    try:
        data = request.json

        if data is None:
            return

        internshipId = data.get("internshipId")

        if internshipId is None:
            return {"message": "Missing required fields", "success": False}

        internship = Internship.prisma().find_unique(where={"id": internshipId})

        if internship is None:
            return {"message": "Internship not found", "success": False}

        Internship.prisma().update(
            where={"id": internshipId},
            data={"status": "APPROVED"},
        )

        return jsonify(
            {
                "message": "Internship approved successfully",
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@admins.route("/students/reject", methods=["POST"])
@admin_token_required
def rejectInternship(user):
    try:
        data = request.json

        if data is None:
            return

        internshipId = data.get("internshipId")

        if internshipId is None:
            return {"message": "Missing required fields", "success": False}

        internship = Internship.prisma().find_unique(where={"id": internshipId})

        if internship is None:
            return {"message": "Internship not found", "success": False}

        Internship.prisma().update(
            where={"id": internshipId},
            data={"status": "REJECTED"},
        )

        return jsonify(
            {
                "message": "Internship rejected successfully",
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@admins.route("/companies", methods=["GET"])
@admin_token_required
def getCompanies(user):
    try:
        companies = Company.prisma().find_many(order={"createdAt": "desc"})
        return jsonify(
            {
                "message": "Companies fetched successfully",
                "data": [
                    {
                        "email": company.email,
                        "companyName": company.companyName,
                        "isApproved": company.isApproved,
                        "createdAt": company.createdAt.isoformat(),
                    }
                    for company in companies
                ],
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@admins.route("/announcements", methods=["GET"])
def getAnnouncements():
    try:
        announcements = Announcement.prisma().find_many(order={"postedAt": "desc"})
        return jsonify(
            {
                "message": "Announcement fetched successfully",
                "data": [
                    {
                        "id": announcement.id,
                        "title": announcement.title,
                        "content": announcement.content,
                        "postedAt": announcement.postedAt.isoformat(),
                    }
                    for announcement in announcements
                ],
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@admins.route("/announcements", methods=["POST"])
@admin_token_required
def createAnnouncement(user):
    try:
        data = request.json

        if data is None:
            return

        title = data.get("title")
        content = data.get("content")

        if title is None or content is None:
            return {"message": "Missing required fields", "success": False}

        announcement = Announcement.prisma().create(
            data={
                "title": title,
                "content": content,
                "admin": {"connect": {"email": user.email}},
            }
        )

        return jsonify(
            {
                "message": "Announcement created successfully",
                "data": {
                    "id": announcement.id,
                    "title": announcement.title,
                    "content": announcement.content,
                    "postedAt": announcement.postedAt.isoformat(),
                },
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


# Delete Announcement
@admins.route("/announcements", methods=["DELETE"])
@admin_token_required
def deleteAnnouncement(user):
    try:
        data = request.json

        if data is None:
            return

        id = data.get("id")

        if id is None:
            return {"message": "Missing required fields", "success": False}

        announcement = Announcement.prisma().find_unique(where={"id": id})

        if announcement is None:
            return {"message": "Announcement not found", "success": False}

        Announcement.prisma().delete(where={"id": id})

        return jsonify(
            {
                "message": "Announcement deleted successfully",
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500
