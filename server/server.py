from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
import os
import boto3
from config import *
from prisma import Prisma, register

from students.routes import students
from supervisors.routes import supervisors
from companies.routes import companies
from admins.routes import admins

db = Prisma()
db.connect()
register(db)

app = Flask(__name__)
app.config["CORS_HEADERS"] = "Content-Type"
app.config["JWT_SECRET_KEY"] = "super-secret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
cors = CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
app.register_blueprint(students, url_prefix="/api/students")
app.register_blueprint(supervisors, url_prefix="/api/supervisors")
app.register_blueprint(companies, url_prefix="/api/companies")
app.register_blueprint(admins, url_prefix="/api/admins")


@app.route("/", methods=["GET", "POST"])
def home():
    return jsonify({"message": "The API server is running!", "success": True})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, debug=True)
