from flask import Flask, Response, jsonify, render_template, request
from flask_cors import CORS
import os
import boto3
from config import *
from prisma import Prisma, register

from students.routes import students

db = Prisma()
db.connect()
register(db)

app = Flask(__name__)
cors = CORS(app, supports_credentials=True)
app.config["CORS_HEADERS"] = "Content-Type"
app.register_blueprint(students, url_prefix="/api/students")

bucket = custombucket
region = customregion

# db_conn = connections.Connection(
#     host=customhost, port=3306, user=customuser, password=custompass, db=customdb
# )
# output = {}
# table = "employee"


@app.route("/api/hello", methods=["GET", "POST"])
def home():
    return jsonify({"message": "This is the home", "success": True})


# @app.route("/addemp", methods=["POST"])
# def AddEmp():
#     emp_id = request.form["emp_id"]
#     first_name = request.form["first_name"]
#     last_name = request.form["last_name"]
#     pri_skill = request.form["pri_skill"]
#     location = request.form["location"]
#     emp_image_file = request.files["emp_image_file"]

#     insert_sql = "INSERT INTO employee VALUES (%s, %s, %s, %s, %s)"
#     cursor = db_conn.cursor()

#     if emp_image_file.filename == "":
#         return "Please select a file"

#     try:
#         cursor.execute(insert_sql, (emp_id, first_name, last_name, pri_skill, location))
#         db_conn.commit()
#         emp_name = "" + first_name + " " + last_name
#         # Uplaod image file in S3 #
#         emp_image_file_name_in_s3 = "emp-id-" + str(emp_id) + "_image_file"
#         s3 = boto3.resource("s3")

#         try:
#             print("Data inserted in MySQL RDS... uploading image to S3...")
#             s3.Bucket(custombucket).put_object(
#                 Key=emp_image_file_name_in_s3, Body=emp_image_file
#             )
#             bucket_location = boto3.client("s3").get_bucket_location(
#                 Bucket=custombucket
#             )
#             s3_location = bucket_location["LocationConstraint"]

#             if s3_location is None:
#                 s3_location = ""
#             else:
#                 s3_location = "-" + s3_location

#             object_url = "https://s3{0}.amazonaws.com/{1}/{2}".format(
#                 s3_location, custombucket, emp_image_file_name_in_s3
#             )

#         except Exception as e:
#             return str(e)

#     finally:
#         cursor.close()

#     print("all modification done...")
#     return render_template("AddEmpOutput.html", name=emp_name)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, debug=True)
