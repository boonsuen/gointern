from flask import Blueprint, current_app, jsonify, make_response, request
from flask_jwt_extended import create_access_token, unset_jwt_cookies
import jwt
import prisma
import boto3
from config import *
from prisma.models import Company, Job

from auth_middleware import admin_token_required, company_token_required

companies = Blueprint("companies", __name__)


@companies.route("/signup", methods=["POST"])
def companySignUp():
    try:
        data = request.json

        if data is None:
            return

        email = data.get("email")
        companyName = data.get("companyName")
        password = data.get("password")

        if email is None or companyName is None or password is None:
            return {"message": "Missing required fields", "success": False}

        company = Company.prisma().create(
            data={
                "email": email,
                "companyName": companyName,
                "password": password,
            }
        )

        return jsonify(
            {
                "message": "Company added successfully",
                "success": True,
            }
        )
    except prisma.errors.UniqueViolationError:
        return jsonify({"message": "Company already exists", "success": False})
    except Exception as e:
        return jsonify({"message": str(e), "success": False})


@companies.route("/login", methods=["POST"])
def companyLogin():
    try:
        data = request.json

        if data is None:
            return

        email = data.get("email")
        password = data.get("password")

        if email is None or password is None:
            return {"message": "Missing required fields", "success": False}

        company = Company.prisma().find_unique(where={"email": email})

        if company is None:
            return jsonify({"message": "Company not found", "success": False})

        if company.password != password:
            return jsonify({"message": "Wrong password", "success": False})

        # Create access token
        access_token = create_access_token(identity=company.email)
        response = make_response(
            jsonify(
                {
                    "access_token": access_token,
                    "success": True,
                    "message": "Company logged in successfully",
                    "data": {
                        "email": company.email,
                        "companyName": company.companyName,
                        "isApproved": company.isApproved,
                    },
                }
            ),
            200,
        )
        response.set_cookie(
            "access_token_company",
            access_token,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=60 * 60 * 24 * 7,
        )

        return response
    except Exception as e:
        return jsonify({"message": str(e), "success": False})


@companies.route("/me", methods=["GET"])
def companyMe():
    try:
        token = request.cookies.get("access_token_company")
        if not token or token == "":
            return (
                jsonify({"message": "Company is not logged in", "success": False}),
                200,
            )

        decoded = jwt.decode(
            token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
        )
        user = Company.prisma().find_unique(where={"email": decoded["sub"]})
        if user is None:
            return {
                "message": "Unauthorized company",
                "data": None,
                "success": False,
            }, 401

        return jsonify(
            {
                "message": "Authorized company",
                "success": True,
                "data": {
                    "email": user.email,
                    "companyName": user.companyName,
                    "isApproved": user.isApproved,
                },
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@companies.route("/logout", methods=["POST"])
def companyLogout():
    try:
        response = make_response(
            jsonify(
                {
                    "message": "Company logged out successfully",
                    "success": True,
                }
            ),
            200,
        )
        response.set_cookie(
            "access_token_company",
            "",
            httponly=True,
            secure=True,
            samesite="None",
            max_age=0,
        )

        return response
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@companies.route("/approve", methods=["POST"])
@admin_token_required
def approveCompany(user):
    try:
        data = request.json

        if data is None:
            return

        email = data.get("email")

        if email is None:
            return {"message": "Missing required fields", "success": False}

        company = Company.prisma().update(
            where={"email": email},
            data={
                "isApproved": True,
            },
        )

        return jsonify(
            {
                "message": "Company approved successfully",
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


@companies.route("", methods=["GET"])
def getApprovedCompanies():
    try:
        companies = Company.prisma().find_many(
            where={"isApproved": True}, order={"createdAt": "desc"}
        )
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

# ----- Job -----
# Add Job
@companies.route("/jobs", methods=["POST"])
@company_token_required
def addJob(company):
    try:
        data = request.json

        if data is None:
            return

        title = data.get("title")
        location = data.get("location")
        salary = data.get("salary")
        description = data.get("description")

        if title is None or location is None or salary is None or description is None:
            return {"message": "Missing required fields", "success": False}

        job = Job.prisma().create(
            data={
                "company": {"connect": {"email": company.email}},
                "title": title,
                "location": location,
                "salary": salary,
                "description": description,
            }
        )

        return jsonify(
            {
                "message": "Job added successfully",
                "data":{
                        "jobId": job.jobId,
                        "title": job.title,
                        "location": job.location,
                        "salary": job.salary,
                        "description": job.description,
                },
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500


# Read Job
@companies.route("/jobs", methods=["GET"])
@company_token_required
def getJobs(company):
    try:
        jobs = Job.prisma().find_many(
            where={"companyEmail": company.email}, include={"company": True}
        )

        return jsonify(
            {
                "message": "Jobs fetched successfully",
                "data": [
                    {
                        "jobId": job.jobId,
                        "title": job.title,
                        "location": job.location,
                        "salary": job.salary,
                        "description": job.description,
                    }
                    for job in jobs
                ],
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500

# Delete Job
@companies.route("/jobs", methods=["DELETE"])
@company_token_required
def deleteJob(company):
    try:
        data = request.json

        if data is None:
            return

        id = data.get("jobId")

        if id is None:
            return {"message": "Missing required fields", "success": False}

        job = Job.prisma().find_unique(where={"jobId": id}, include={"company": True})

        if job is None:
            return {"message": "Job not found", "success": False}

        Job.prisma().delete(where={"jobId": id})

        return jsonify(
            {
                "message": "Job deleted successfully",
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500

# Update Job
@companies.route("/jobs", methods=["PUT"])
@company_token_required
def updateJob(company):
    try:
        data = request.json

        if data is None:
            return

        jobId = data.get("jobId")
        title = data.get("title")
        location = data.get("location")
        salary = data.get("salary")
        description = data.get("description")

        if jobId is None:
            return {"message": "Missing required fields", "success": False}

        job = Job.prisma().find_unique(where={"jobId": jobId})
        print(jobId)

        if job is None:
            return {"message": "Job not found", "success": False}

        Job.prisma().update(
            where={"jobId": jobId},
            data={
                "title": title,
                "location": location,
                "salary": salary,
                "description": description,
            },
        )

        return jsonify(
            {
                "message": "Job updated successfully",
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500

# ----- Jobboard -----
@companies.route("/jobboard", methods=["GET"])
def retriveJobs():
    try:
        jobs = Job.prisma().find_many(order={"postedAt": "desc"}, include={"company": True})

        return jsonify(
            {
                "message": "Job fetched successfully",
                "data": [
                    {
                        "jobId": job.jobId,
                        "title": job.title,
                        "location": job.location,
                        "salary": job.salary,
                        "description": job.description,
                        "postedAt": job.postedAt.isoformat(),
                        "companyEmail": job.companyEmail,
                        "company": job.company.companyName
                    }
                    for job in jobs
                ],
                "success": True,
            }
        )
    except Exception as e:
        return jsonify({"message": str(e), "success": False}), 500

        




        

