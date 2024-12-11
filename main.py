from flask import Flask, request, jsonify, send_file, send_from_directory
import io, os, shutil

from flask_mysqldb import MySQL

from flask_cors import CORS
import jwt
from functools import wraps

from datetime import datetime, timedelta

import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import decimal

app = Flask(__name__)

app.config['MYSQL_HOST'] = "localhost"
app.config['MYSQL_USER'] = "root"
app.config['MYSQL_PASSWORD'] = "irsad"
app.config['MYSQL_DB'] = "indiaadvisory"

mysql = MySQL(app)

# By Sandhi Gurung - 12-Jun-2024
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # 2MB limit =

app.config['UPLOADED_IMAGE_FOLDER'] = "uploadedfiles"
app.config['PROFILEPIC_TEMPIMAGE_FOLDER'] = "uploadedfiles/ProfilePicsTemp"
app.config['PROFILEPIC_IMAGE_FOLDER'] = "uploadedfiles/ProfilePics"

app.config["API_URL"] = "http://127.0.0.1:5000"

CORS(app)

app.config['SECRET_KEY'] = '33kuberJWT'
token_blacklist = set()
# End Sandhi Gurung Code

def encode_auth_token(user_id):
    # By Sandhi Gurung - 10-Jun-20204 (For Encoding Token)
    """
    Generates the Auth Token
    :return: string
    """
    # print('encode_auth_token')

    try:
        payload = {
            'exp': datetime.utcnow() + timedelta(days=1, seconds=5),
            'iat': datetime.utcnow() - timedelta(minutes=1),  # Buffer for clock drift
            'nbf': datetime.utcnow() - timedelta(minutes=1),  # Buffer for not-before time
            'sub': user_id
        }

        token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
        
        return token

    except Exception as e:
        # print('error in encode_auth_token')
        return str(e)

def decode_auth_token(auth_token):
    # By Sandhi Gurung - 10-Jun-20204 (For Decoding Token)
    """
    Decodes the auth token
    :param auth_token:
    :return: integer|string
    """
    # print("decode_auth_token api called")

    try:
        payload = jwt.decode(auth_token, app.config['SECRET_KEY'], algorithms=['HS256'])
        
        # print('payload')
        # print(payload)

        return payload['sub']
    
    except jwt.ExpiredSignatureError:
        print('signature expired')
        return 'Signature expired. Please log in again.'
    except jwt.InvalidTokenError:
        print('invalid token')
        return 'Invalid token. Please log in again.'
    except jwt.exceptions.ImmatureSignatureError as e:
        print(f"Token is not yet valid: {e}")  # Debug log
        return 'Token is not yet valid. Please wait a moment and try again.'


def token_required(f):
    # By Sandhi Gurung - 10-Jun-20204 (For Checking Token)
    # print("token_required called")

    @wraps(f)
    def _verify(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'message': 'Token is missing!'}), 403
        try:
            token = auth_header.split(" ")[1]

            # print('header')
            # print(auth_header)

            # print('token')
            # print(token)

            if token in token_blacklist:
                return jsonify({'message': 'Invalid Token'}), 403
            
            data = decode_auth_token(token)

            # print('decoded data : ' + data)
            # print(jsonify({'message': data}))

            if isinstance(data, str) and data not in ['Invalid Token', 'Signature expired. Please log in again.', 'Invalid token. Please log in again.', 'Token is not yet valid. Please wait a moment and try again.']:
                return f(*args, **kwargs)
            else:
                return jsonify({'message': data}), 403
            
        except Exception as e:
            return jsonify({'message': str(e)}), 403

    return _verify


@app.route("/")
def hello_world():
    return "Hello New World"

@app.route('/send_email', methods=['POST'])
def send_email():
    # Get data from the request
    # email_server ="gmail"
    email_server ="SMTP"    # By Sandhi Gurung - 09-May-2024 
    
    print('Send_email API Called for ' + email_server + ' Server') # By Sandhi Gurung - 09-May-2024

    # By Sandhi Gurung - 09-May-2024
    if email_server=="gmail":
        sender_email = '33kuber2023@gmail.com'
        # sender_email = 'naveednyc4@gmail.com'
        password = 'aitf vinn cimp dwvv'  # Remember, do not hardcode passwords in production!
        # password = 'naveedns'
    
    if email_server=="SMTP":
        sender_email = 'info@33kuber.com'
        password = 'info33kuber$'
    # End Sandhi Change - 09-May-2024

    data = request.get_json()
    
    email_to = data['email_to']
    cc_emails = data['cc_emails']
    bcc_emails = data['bcc_emails']

    print("Email to ", email_to)
    
    subject = 'JazzTrack: ' + data['subject']

    message = data['message']
    
    # print("email_to", email_to)
    # print("cc_emails", cc_emails)
    # print("bcc_emails", bcc_emails)

    # Construct the email
    msg = MIMEMultipart()
    msg['From'] = sender_email

    msg['To'] = ", ".join(email_to)

    # print("To",msg['To'])

    # print("CC_emails", cc_emails)

    if cc_emails:
        msg['Cc'] = ", ".join(cc_emails)

    
    if bcc_emails:
        msg['Bcc'] = ", ".join(bcc_emails)
    
    # print('CC ',msg['Cc'])

    msg['Subject'] = subject

    # Attach the message to the email
    print('Attaching message to email') # By Sandhi Gurung - 09-May-2024
    msg.attach(MIMEText(message, 'html'))

    # Setup SMTP server
    print('Setting up SMTP Server')     # By Sandhi Gurung - 09-May-2024

    # By Sandhi Gurung - 09-May-2024
    if email_server=="gmail":
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()

    if email_server=="SMTP":
        smtp_server = 'smtpout.secureserver.net'
        smtp_port = 465  # SSL port

        server = smtplib.SMTP_SSL(smtp_server, smtp_port)
    # End Sandhi Change - 09-May-2024
    
    # Log in to your email account
    print('Login to email Account') # By Sandhi Gurung - 09-May-2024
    server.login(sender_email, password)

    all_recipients = email_to
    
    if cc_emails:
        all_recipients = all_recipients + cc_emails 
    
    if bcc_emails:
        all_recipients = all_recipients + bcc_emails

    # print("email_to after Formatting", email_to)
    # print("cc_emails after Formatting", cc_emails)
    # print("bcc_emails after Formatting", bcc_emails)

    print("all_recipients", all_recipients)
    # Send email
    server.sendmail(sender_email, all_recipients, msg.as_string())

    # Close the SMTP server
    server.quit()

    return jsonify({"RtnFlag" : True, "RtnMsg": "Email Sent successfully"}), 200


# Send Email
@app.route("/sendMail", methods = ["POST"])
def sendMail():
    print('sendMail API Called')
    data = request.get_json()

    TemplateId = data["TemplateId"]
    RefId = data["RefId"]
    UserId = data["UserId"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_getEmailTemplateDetails", [TemplateId])  # Using parameterized query
    returnResult = cur.fetchall()
    if len(returnResult) == 0:
        cur.close()  # Close cursor before returning
        return jsonify({"RtnFlag": False, "RtnMsg": "No email template found"}), 404

    EmailSP = returnResult[0][0]

    cur.close()  # Close cursor after fetching results

    cur = mysql.connection.cursor()

    cur.callproc(EmailSP, (RefId, UserId))

    result = cur.fetchall()

    

    if len(result) == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while getting email"}), 500

    rtnFlag = result[0][0]
    
    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while getting email"}), 500
    else:
        mailSubject = result[0][1]
        mailBody = result[0][2]
        email_to = result[0][3].split(',')
        mailCC = result[0][4].split(',')

        bCCEmailIds = result[0][5]
        bCCEmailIds = bCCEmailIds + ",naveednyc4@gmail.com"

        mailBCC = bCCEmailIds.split(',')

        # print("mailSubject : ", mailSubject)
        # print("mailBody : ", mailBody)
        # print("email_to without formatting:", result[0][3])
        # print("email_to with formatting: ", email_to)

        # print("mailCC without formatting:", result[0][4])
        # print("mailCC with formatting: ", mailCC)
        # print("mailCC : ", mailCC)
        # print("mailBCC : ", mailBCC)

        print("mailBCC without formatting:", result[0][5])
        print("mailBCC with formatting: ", mailBCC)

        # Call the send_email endpoint
        send_email_data = {
            'email_to': email_to,
            'cc_emails': mailCC,
            'bcc_emails': mailBCC,
            'subject': mailSubject,
            'message': mailBody
        }
        print("email post data", send_email_data)
        response = requests.post('http://127.0.0.1:5000/send_email', json=send_email_data)
    # insert in gl_email_d table 

    # After fetching results from the first stored procedure call
    cur.close()  # Close the cursor

    # Open a new cursor before executing the next stored procedure call
    cur = mysql.connection.cursor()

    # email_to_str = ','.join(email_to)
    # mailCC_str = ','.join(mailCC)
    # mailBCC_str = ','.join(mailBCC)

    # print("TemplateId : ", TemplateId)
    # print("mailSubject : ", mailSubject)
    # print("mailBody : ", mailBody)
    # print("email_to : ", email_to_str)
    # print("mailCC : ", mailCC_str)
    # print("mailBCC : ", mailBCC_str)
    # print("UserId: ", UserId)

    
    cur.close()
    print('Sendemail response', response);

    if response.status_code == 200:
        # Close the cursor before opening a new one
        cur.close()

        # Open a new cursor
        cur = mysql.connection.cursor()

        # Join email lists into strings
        email_to_str = ','.join(email_to)
        mailCC_str = ','.join(mailCC)
        mailBCC_str = ','.join(mailBCC)

        # Call the second stored procedure to insert email data
        print("Before insert in SP InsertEmailDetails")

        cur.callproc("SP_InsertEmailData", (TemplateId, RefId, mailSubject, email_to_str, mailCC_str, mailBCC_str, mailBody, UserId))
        resultForEamil = cur.fetchall()
        print(resultForEamil)

        print("after insert in SP InsertEmailDetails")
        # Close the cursor after executing the stored procedure
        cur.close()

        return jsonify({
            "RtnFlag": True,
            "RtnMsg": "Email sent successfully and email data inserted"
        }), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error sending email"}), 500


# send Notification

@app.route("/sendNotification", methods=["POST"])
def sendNotification():
    print('sendNotification API Called')
    data = request.get_json()

    TemplateId = data.get("TemplateId")
    RefId = data.get("RefId")
    UserId = data.get("UserId")

    cur = mysql.connection.cursor()

    cur.callproc("SP_getNotificationTemplateDetails", [TemplateId])

    returnResult = cur.fetchall()
    if len(returnResult) == 0:
        cur.close()  
        return jsonify({"RtnFlag": False, "RtnMsg": "No Notification template found"}), 404

    NotificationSP = returnResult[0][0]

    cur.close()  # Close cursor after fetching results

    cur = mysql.connection.cursor()

    print('Notification SP : ', NotificationSP)
    print('Template Id : ', TemplateId)
    print('Ref Id : ', RefId)
    print('User Id: ', UserId)

    cur.callproc(NotificationSP, (TemplateId, RefId, UserId))

    result = cur.fetchall()
    cur.close()  # Close cursor after fetching results

    if len(result) == 0:
        print('Notification Sending Failed')
        return jsonify({"RtnFlag": False, "RtnMsg": "Notification Sending Failed"}), 500

    rtnFlag = result[0][0]
    rtnMsg = result[0][1]

    if rtnFlag == 0:
        print('Error while Sending Notification', rtnMsg )
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Sending Notification : " + rtnMsg}), 500
    
    # Add a success response here
    return jsonify({"RtnFlag": True, "RtnMsg": "Notification send successfully"}), 200


@app.route('/getProfilePicTempImage/<filename>', methods=['GET'])
def get_ProfilePicTempImage(filename):
    # By Sandhi Gurung - 10-Jun-2024 (For getting profile Pic from ProfilePicsTemp Folder)
    try:
        # print(app.config['PROFILEPIC_TEMPIMAGE_FOLDER'])
        # return send_from_directory(app.config['PROFILEPIC_TEMPIMAGE_FOLDER'], filename)
    
        response = requests.get(app.config['API_URL'] + "/ " + app.config['PROFILEPIC_TEMPIMAGE_FOLDER'] + "/" + filename)
        file = io.BytesIO(response.content)
        # file.seek(0)
        
        # print('file name : ' + file)

        return send_file(file, as_attachment=True, download_name='profilepic.jpg', mimetype='image/jpeg')
    
    except FileNotFoundError:
        return "Image not found", 404

@app.route('/getProfilePicImage/<filename>', methods=['GET'])
def get_ProfilePicImage(filename):
    # By Sandhi Gurung - 10-Jun-2024 (For uploading profile Pic in ProfilePics Folder)
    try:
        print(app.config['PROFILEPIC_IMAGE_FOLDER'])
        return send_from_directory(app.config['PROFILEPIC_IMAGE_FOLDER'], filename)
    except FileNotFoundError:
        # return "Image not found", 404
        print('image not found')
        print(app.config['UPLOADED_IMAGE_FOLDER'])

        return send_from_directory(app.config['UPLOADED_IMAGE_FOLDER'], "userimage.jpg")

@app.route('/getUserDefaultProfilePicImage', methods=['GET'])
def get_UserDefaultProfilePicImage():
    # By Sandhi Gurung - 10-Jun-2024 (For getting default profile Pic)
    try:
        print(app.config['UPLOADED_IMAGE_FOLDER'])

        return send_from_directory(app.config['UPLOADED_IMAGE_FOLDER'], "userimage.jpg")
    except FileNotFoundError:
        return "Image not found", 404
        

@app.route('/uploadUserProfilePicTemp', methods=['POST'])
def upload_UserProfilePicTemp():
    # By Sandhi Gurung - 10-Jun-2024 (For uploading profile Pic in ProfilePicsTemp Folder)
    print('uploadUserProfilePicTemp api called')

    if 'file' not in request.files:
        return 'No file part'
    
    print('file found')

    file = request.files['file']
    
    print('file : ', file)
    
    if file.filename == '':
        return 'No selected file'
    if file:
        print('File Found')

        # Save the file to a location
        file.save('uploadedFiles/ProfilePicTemp/' + file.filename)

        return 'File uploaded successfully'
    
@app.route('/uploadUserProfilePic', methods=['POST'])
def upload_UserProfilePic():
    # By Sandhi Gurung - 10-Jun-2024 (For uploading profile Pic in ProfilePics Folder)
    print('uploadUserProfilePic api called')

    if 'file' not in request.files:
        return 'No file part'
    
    print('file found')

    file = request.files['file']
    UserId = request.form.get('UserId')
    
    print('file : ', file)
    print('UserId : ', UserId)
    
    if file.filename == '':
        return 'No selected file'
    if file:
        print('File Found')

        # Save the file to a location
        file.save('uploadedFiles/ProfilePics/' + str(UserId) + ".jpg")
        # file.save('uploadedFiles/ProfilePics/' + file.filename)

        return 'File uploaded successfully'

@app.route('/uploadUserProfilePicFinal/<UserId>')
def upload_UserProfilePicFinal(UserId):
    # By Sandhi Gurung - 10-Jun-2024 (For uploading profile Pic from ProfilePicTemp Folder to ProfilePic Folder)
    print('uploadUserProfilePicFinal api called')

    # response = requests.get(app.config["API_URL"] + '/get_image/' + UserId + '.jpg')
    # response = requests.get(app.config["API_URL"] + '/getProfilePicTempImage/ProfilePic2.jpg')

    # file = response.blob()
    
    # print('response : ', response)
    # print('file : ', file)

    # if file.filename == '':
    #     return 'No selected file'
    # if file:
    #     print('File Found')

    #     # Save the file to a location
    #     file.save('uploadedFiles/ProfilePic/' + file.filename)

    #     return 'File uploaded successfully'
    
    # if response.status_code == 200:
    #     # Create an in-memory bytes buffer to hold the image
    #     # with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
    #     #     tmp_file.write(response.content)
    #     #     tmp_file_path = tmp_file.name

    #     file = send_from_directory(app.config['PROFILEPIC_TEMPIMAGE_FOLDER'], "ProfilePic2.jpg");

    #     print('file : ', file)
        
    #     return jsonify({"success": "Temp image retrieve successfully"}), response.status_code
    # else:
    #     return jsonify({"error": "Failed to retrieve image"}), response.status_code
    
    source_path = app.config['PROFILEPIC_TEMPIMAGE_FOLDER'] + "/profilepic2.jpg"
    destination_path = app.config['PROFILEPIC_IMAGE_FOLDER'] + "/ProfilePic2.jpg"

    source_path_abs = os.path.abspath(source_path)
    destination_path_abs = os.path.abspath(destination_path)

    print('source_path', source_path)
    print('destination_path', destination_path)

    print('source_path_abs', source_path_abs)
    print('destination_path_abs', destination_path_abs)

    if not os.path.exists(source_path_abs):
        return jsonify({'error': 'Source file does not exist'}), 400
    
    try:
        print('source file exists')
        # Ensure the destination directory exists
        os.makedirs(os.path.dirname(destination_path), exist_ok=True)
        
        # Copy the file
        shutil.copyfile(source_path, destination_path)
        
        return jsonify({'message': 'File copied successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get Filtered Time Sheet Entry
@app.route("/timesheetentry/getFilteredTimeSheetEntries")
@token_required
def get_FilteredTimeSheetEntry():
   
    ProjectName = request.args.get("ProjectName")
    Status = request.args.get("Status")
    FromDate = request.args.get("FromDate")
    ToDate = request.args.get("ToDate")
    EmployeeId = request.args.get("EmployeeId")
    CompanyId = request.args.get("CompanyId")

    cur = mysql.connection.cursor()

    to_json = []
   
    sCond ='1=1'
   
    sQry = 'select TimeSheetId, ProjectId, TaskName,TaskDescription, ProjectName, fn_getFormattedDate(Date) as EntryDateFormatted, convert(FromTime, char(5)) as FromTime, convert(ToTime, char(5)) as ToTime, StatusName, StatusUpdatedByUserName, fn_getFormattedDateTime(StatusUpdatedOn, 0) as StatusUpdatedOn, StatusUpdatedRemarks as Remarks';
    sQry = sQry + " from vw_gettimesheetentrydetails"

    if ProjectName != "" and ProjectName is not None:
      sCond = sCond + ' and ProjectId = "' + ProjectName + '"'
   
    if Status != "" and Status is not None:
        sCond = sCond + ' and Status = "' + Status + '"'

    if FromDate != "" and FromDate is not None:
        sCond = sCond + ' and Date >= "' + FromDate + '"'

    if ToDate != "" and ToDate is not None:
        sCond = sCond + ' and Date <= "' + ToDate + '"'

    sCond = sCond + ' and EmployeeId = "' + EmployeeId + '"'

    sCond = sCond + ' and CompanyId = "' + CompanyId + '"'

    sQry = sQry + ' where ' + sCond + ' ORDER BY TimeSheetId DESC'
    print(sQry)

    timesheetentries = cur.execute(sQry)

    if timesheetentries > 0:
        timesheetentry_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200


# Inserting TimeSheetEntry
@app.route("/timesheetentry/insertTimeSheetEntry", methods = ["POST"])
@token_required
def insert_TimeSheetEntry():
    try:
        # Retrieving Data Posted to API
        data = request.get_json()

        IP = data["IP"]
        CompanyId = data["CompanyId"]
        EmployeeId = data["EmployeeId"]
        ProjectId = data["ProjectId"]
        TaskName = data["TaskName"]
        TaskDescription = data["TaskDescription"]
        EntryDate = data["EntryDate"]
        FromTime = data["FromTime"]
        ToTime = data["ToTime"]
        CreatedBy = data["UserId"]

        cur = mysql.connection.cursor()

        print('calling SP_InsertTimeSheetEntry')

        cur.callproc("SP_InsertTimeSheetEntry", (IP,CompanyId, EmployeeId, ProjectId, TaskName,TaskDescription, EntryDate, FromTime, ToTime, CreatedBy))
        # result = cur.stored_results().fetchone()[2]

        print('getting result')

        result = cur.fetchall()

        rtnFlag = result[0][0]
        TimeSheetId = result[0][2]
       
        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving Time Sheet Entry", "RtnRefId" : 0}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag" : True, "RtnMsg": "Time Sheet Entry saved successfully", "RtnRefId" : TimeSheetId}), 201
       
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Saving Time Sheet Entry. Error : " + str(e)}), 500
   
    finally:
        cur.close()

@app.route("/task/getProjectLocationDropDown/<ProjectId>")
@token_required
def get_ProjectLocationDropDown(ProjectId):

    cur = mysql.connection.cursor()

    if ProjectId=="undefined":
        ProjectId = 0

    cur.execute("SELECT LocationId, Location FROM ts_project_location_d where ProjectId = " + str(ProjectId))

    Designation_data = cur.fetchall()

    print(Designation_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
   
    designation_json = json.dumps(data)
   
    designation_json = json.loads(designation_json)


    designaitons = [
        {"value": designations["LocationId"], "label": designations["Location"]}
        for designations in designation_json
    ]
    return designaitons, 200


# Updating TimeSheetEntry
@app.route("/timesheetentry/updateTimeSheetEntry", methods = ["POST"])
@token_required
def update_TimeSheetEntry():
    try:
        # Retrieving Data Posted to API

        data = request.get_json()

        print("updateTimeSheetEntry Api Called")

        cur = mysql.connection.cursor()

        TimeSheetId = data["TimeSheetId"]
        EmployeeId = data["EmployeeId"]
        ProjectId = data["ProjectId"]
        TaskName = data["TaskName"]
        TaskDescription = data["TaskDescription"]
        EntryDate = data["EntryDate"]
        FromTime = data["FromTime"]
        ToTime = data["ToTime"]
        ModifiedBy = data["UserId"]
       
        print('calling SP_UpdateTimeSheetEntry')

        cur.callproc("SP_UpdateTimeSheetEntry", (TimeSheetId, EmployeeId, ProjectId, TaskName,TaskDescription, EntryDate, FromTime, ToTime, ModifiedBy))
       
        print('SP_UpdateTimeSheetEntry Called')

        result = cur.fetchall()

        rtnFlag = result[0][0]
        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")

            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Updating Time Sheet Entry"}), 500
        else:
            print("rtnFlag = 1")

            return jsonify({"RtnFlag" : True, "RtnMsg": "Time Sheet Entry Updated successfully"}), 201
   
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Updating Time Sheet Entry. Error : " + str(e)}), 500
   
    finally:
        cur.close()

# History TimeSheetEntry Approval API

@app.route("/timesheetapproval/getTimeSheetEntryHistoryDetails")
def get_TimeSheetEntry_HistoryDetails():
    TimeSheetId = request.args.get("TimeSheetId")
    
    # try:
    cur = mysql.connection.cursor()

    cur.callproc("SP_getTimeSheetEntry_HistoryDetails", [TimeSheetId])

    history_details = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

    # Leave Application Cancel


@app.route("/leaveapplication/CancelLeaveApplication", methods=["POST"])
@token_required
def Cancel_LeaveApplication():
    # Retrieve data posted to the API
    data = request.get_json()

    print(data)

    ApplicationId = data["ApplicationId"]
    Status = data["Status"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]
    StatusUpdatedBy = data["StatusUpdatedBy"]

    cur = mysql.connection.cursor()

    print('calling SP_CancelLeaveApplication')

    cur.callproc("SP_CancelLeaveApplication", (ApplicationId, Status, StatusUpdatedRemarks, StatusUpdatedBy))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Cancelling the Application"}), 500
    else:
        return jsonify({"RtnFlag": True, "RtnMsg": "Leave Application Cancelled Successfully"}), 200


# History LeaveApproval API
@app.route("/leaveapplication/getLeaveApplicationHistoryDetails")
def get_LeaveApplication_HistoryDetails():
    ApplicationId = request.args.get("ApplicationId")
    
    # try:
    cur = mysql.connection.cursor()

    cur.callproc("SP_getLeaveApplication_HistoryDetails", [ApplicationId])

    history_details = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

@app.route("/task/getEmployeeListForTesting")
@token_required
def getEmployeeListForTesting():
   
    CompanyId = request.args.get("CompanyId")
    print("CompanyId="+CompanyId)
    
    cur = mysql.connection.cursor()
   
    query = 'SELECT EmployeeId, EmployeeName FROM vw_getemployeedetails WHERE RoleId=8 and CompanyId='+CompanyId
    
    cur.execute(query)


    projects_data = cur.fetchall()


    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in projects_data]


    employees = [
        {"value": employee["EmployeeId"], "label": employee["EmployeeName"]}
        for employee in data
    ]

    return jsonify(employees), 200

@app.route("/task/getEmployeeListForAllocation", methods=["GET"])
@token_required
def get_EmployeeListForAllocation():
   
    CompanyId = request.args.get("CompanyId")
    print("CompanyId="+CompanyId)

    cur = mysql.connection.cursor()
   
    query = 'SELECT EmployeeId, EmployeeName,ifnull(EmployeeDesignationId,"") as EmployeeDesignationId ,ifnull(EmployeeDesignationName,"") as EmployeeDesignationName FROM vw_getemployeedetails WHERE RoleId!=8 and CompanyId='+CompanyId

    cur.execute(query)

    projects_data = cur.fetchall()
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in projects_data]
    employees = [
        {"value": employee["EmployeeId"], "label": employee["EmployeeName"] + " (" + employee["EmployeeDesignationName"] + ")"}
        for employee in data
    ]
    return jsonify(employees), 200

#API for getting developers and managers only
@app.route("/task/getEmployeeforDevelopers", methods=["GET"])
@token_required
def get_EmployeeListforDevelopers():
   
    CompanyId = request.args.get("CompanyId")
    print("CompanyId="+CompanyId)

    cur = mysql.connection.cursor()
   
    query = 'SELECT EmployeeId, EmployeeName,ifnull(EmployeeDesignationId,"") as EmployeeDesignationId ,ifnull(EmployeeDesignationName,"") as EmployeeDesignationName FROM vw_getemployeedetails WHERE EmployeeDesignationName IN ("Developer","Manager") and CompanyId='+CompanyId

    cur.execute(query)

    projects_data = cur.fetchall()
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in projects_data]
    employees = [
        {"value": employee["EmployeeId"], "label": employee["EmployeeName"] + " (" + employee["EmployeeDesignationName"] + ")"}
        for employee in data
    ]
    return jsonify(employees), 200

#API for getting all roles except QC
@app.route("/task/getEmployeeListForAll", methods=["GET"])
@token_required
def get_EmployeeListForAll():
   
    CompanyId = request.args.get("CompanyId")
    print("CompanyId="+CompanyId)

    cur = mysql.connection.cursor()
   
    query = 'SELECT EmployeeId, EmployeeName,ifnull(EmployeeDesignationId,"") as EmployeeDesignationId ,ifnull(EmployeeDesignationName,"") as EmployeeDesignationName FROM vw_getemployeedetails WHERE EmployeeDesignationName NOT IN ("Quality Checker","Human Resource") and CompanyId='+CompanyId

    cur.execute(query)

    projects_data = cur.fetchall()
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in projects_data]
    employees = [
        {"value": employee["EmployeeId"], "label": employee["EmployeeName"] + " (" + employee["EmployeeDesignationName"] + ")"}
        for employee in data
    ]
    return jsonify(employees), 200


# get My Team List

@app.route("/task/getMyTeamList", methods=["GET"])
def get_MyTaskTeamList():
   
    ManagerId = request.args.get("ManagerId")
    CategoryId = request.args.get("CategoryId")
    EmployeeDesignationId = request.args.get("DesignationId")
    EmployeeDepartmentId = request.args.get("DepartmentId")

    cur = mysql.connection.cursor()
    cur.callproc("SP_getMyTeamDetails", [ManagerId,CategoryId,EmployeeDesignationId,EmployeeDepartmentId])
    data = cur.fetchall()

    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in data]

    result = json.dumps(data)

    print (result)
    # print(jsonify(result))
    cur.close()
    return result, 200


    # Employee History

@app.route("/employee/getEmployeeHistoryDetails")
def get_EmployeeHistory():

    EmployeeId = request.args.get("EmployeeId")
    # try:
    cur = mysql.connection.cursor()

    print('calling history sp')
   
    cur.callproc("SP_getEmployeeHistoryDetails", [EmployeeId])

    print('fetching history data')
    history_details = cur.fetchall()

    print('history fetched')
    print(history_details)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    print(data)

    return to_json, 200

# Issue History

@app.route("/Issuelistmanager/getIssueHistoryDetails")
@token_required
def getIssueHistoryData():


    IssueId = request.args.get("IssueId")
    # try:
    cur = mysql.connection.cursor()


    print('calling history sp')
   
    cur.callproc("Ts_Sp_GetManagerIssueHistoryDetails", [IssueId])


    print('fetching history data')
    history_details = cur.fetchall()


    print('history fetched')
    print(history_details)


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]


    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    print(data)


    return to_json, 200



# Task Filter

@app.route("/task/getFilteredtask")
@token_required
def get_FilteredTask():
    print('getFilteredtask api called')
    cur = mysql.connection.cursor()


    ProjectId = request.args.get("ProjectId")
    TaskStatus = request.args.get("TaskStatus")
    FromDate = request.args.get("FromDate")
    ToDate = request.args.get("ToDate")
    CompanyId = request.args.get("CompanyId")


    to_json = []
   
    sCond ='1=1'
   
    sQry = 'select TaskId, TaskName, TaskTypeId, TaskTypeName, ProjectId, ProjectName,LocationId,Location,CustomerName,'
    sQry = sQry + ' MenuName, MenuCode, SubMenuCode, SubMenuName,'
    sQry = sQry + ' fn_getFormattedDate(TargetDate) as TargetDateFormat, DATE_FORMAT(TargetDate, "%Y-%m-%d") as TargetDateFormated,'
    sQry = sQry + ' TaskStatus, TaskStatusName, TaskAllocatedTo, AllocatedToEmployeeFullName, fn_getFormattedDateTime(TaskAllocatedOn, 0) as TaskAllocatedOnFormat, '
    sQry = sQry + ' DATE_FORMAT(TaskAllocatedOn, "%Y-%m-%d") as TaskAllocatedOnFormated, TaskAllocatedRemarks,AssignedForTestingQCName,fn_getFormattedDateTime(TaskForTestingAssignedOn,0) as TaskForTestingAssignedOn ,TotalIssue, '
    sQry = sQry + ' fn_getFormattedDate(TaskStartDate) as TaskStartDateFormated, convert(TaskStartTime , char(5)) as TaskStartTimeFormated, '
    sQry = sQry + ' TaskStartRemarks, fn_getFormattedDateTime(TaskEndDate, 0) as TaskEndDateFormated, TaskEndRemarks, TaskCreatedBy, TaskCreatedByFullName, fn_getFormattedDateTime(TaskCreatedOn, 0) as TaskCreatedOnFormated,TextColor,BackGroundColor, '
    sQry = sQry + ' TaskModifiedByFullName, ModifiedOnFormatted as LastModifiedDateFormated, StatusUpdatedByFullName ,AssignedForTestingQCName,TaskForTestingRemarks,TaskForTestingAssignedOnFormatted,'
    sQry = sQry + ' fn_getFormattedDateTime(StatusUpdatedOn, 0) as StatusUpdatedOnFormated, StatusUpdatedRemarks,TaskDescription,ReleasedOnFormatted,ReleasedRemarks'  
    sQry = sQry + ' from ts_vw_gettaskdetails'
   

    if CompanyId:
        sCond += " AND CompanyId = " + CompanyId    

    if ProjectId != "0" and ProjectId is not None:
      sCond = sCond + ' and ProjectId = "' + ProjectId + '"'
 
    if TaskStatus != "" and TaskStatus is not None:
        sCond = sCond + ' and TaskStatus = "' + TaskStatus + '"'

    if FromDate != "" and FromDate is not None:
        sCond = sCond + ' and TargetDate >= "' + FromDate + '"'

    if ToDate != "" and ToDate is not None:
        sCond = sCond + ' and TargetDate <= "' + ToDate + '"'

    # sCond = sCond + ' and ManagerId = "' + ManagerId + '"'

    sQry = sQry + ' WHERE ' + sCond + ' ORDER BY ModifiedOn DESC'

    print(sQry)

    TaskAllocationFiltered = cur.execute(sQry)

    if TaskAllocationFiltered > 0:
        TaskAllocationFiltered_data = cur.fetchall()


        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)
    return to_json, 200


@app.route("/task/getTaskStatusDropDown")
@token_required
def get_TaskStatusDropDown():

    cur = mysql.connection.cursor()
   
    cur.execute('SELECT DISTINCT StatusCode , StatusName FROM gl_status_m where StatusFor IN ("Task","Issue")')

    TaskStatus_data = cur.fetchall()

    # print(projects_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    taskstatus_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(taskstatus_json)[0]["StatusCode"])
   
    taskstatus_json = json.loads(taskstatus_json)

    tasksstatus = [
        {"value": TasksStatus["StatusCode"], "label": TasksStatus["StatusName"]}
        for TasksStatus in taskstatus_json
    ]
    return tasksstatus, 200

# TaskTypeDropdown

@app.route("/tasktype/getTasktypeDropDown")
@token_required
def get_TasktypeDropDown():

    cur = mysql.connection.cursor()
   
    cur.execute('SELECT TaskTypeId , TaskTypeName FROM ts_tasktype_m')

    TaskType_data = cur.fetchall()

    # print(projects_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    tasktype_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(tasktype_json)[0]["TaskTypeId"])
   
    tasktype_json = json.loads(tasktype_json)

    tasktypes = [
        {"value": Tasktype["TaskTypeId"], "label": Tasktype["TaskTypeName"]}
        for Tasktype in tasktype_json
    ]
    return tasktypes, 200

# Selection ProejectName dropdown
@app.route("/project/getSelectionProjectDropDown/<CompanyId>")
# @token_required
def get_SelectionProjectDropDown(CompanyId):
    cur = mysql.connection.cursor()
    
    print("SELECT ProjectId, ProjectName FROM ts_project_m where CompanyId = " +str(CompanyId))
    if CompanyId=="undefined":
         CompanyId = 0

    cur.execute("SELECT ProjectId, ProjectName FROM ts_project_m where CompanyId = " +str(CompanyId))

    projects_data = cur.fetchall()

    # print(projects_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    projects_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(projects_json)[0]["ProjectId"])
    
    projects_json = json.loads(projects_json);

    projects = [
        {"value": project["ProjectId"], "label": project["ProjectName"]}
        for project in projects_json
    ]

    return projects, 200
    
# Selection StatusName dropdown

# @app.route("/project/getSelectionStatusDropDown")
# def get_SelectionStatusDropDown():
#     cur = mysql.connection.cursor()
    
#     cur.execute('SELECT StatusCode as Status, StatusName FROM timesheetentry.gl_status_m WHERE StatusFor = "Project" AND StatusName IN ("Underplanning", "InProgress", "QualityCheck", "Completed", "Closed");')

#     projects_data = cur.fetchall()

#     # print(projects_data)

#     rows = [x for x in cur]
#     columns = [col[0] for col in cur.description]

#     data = [dict(zip(columns, row)) for row in rows]
       
#     # to_json = json.dumps(data, indent=2)
#     projects_json = json.dumps(data)

#     # print(projects_json)
#     print(json.loads(projects_json)[0]["Status"])
    
#     projects_json = json.loads(projects_json);

#     projects = [
#         {"value": project["Status"], "label": project["StatusName"]}
#         for project in projects_json
#     ]

#     return projects, 200

# Get Filtered Time Sheet Approval
@app.route("/timesheetapproval/getFilteredTimeSheetApprovals")
@token_required
def get_FilteredTimeSheetApproval():
    ProjectName = request.args.get("ProjectName")
    EmployeeName = request.args.get("EmployeeName")
    Status = request.args.get("Status")
    FromDate = request.args.get("FromDate")
    ToDate = request.args.get("ToDate")
    ManagerId = request.args.get("ManagerId")
    CompanyId = request.args.get("CompanyId")

    cur = mysql.connection.cursor()

    to_json = []
   
    sCond ='1=1'
   
    sQry = 'select TimeSheetId, ProjectId, EmployeeId, EmployeeName, TaskName, ProjectName, fn_getFormattedDate(Date) as EntryDateFormatted, convert(FromTime, char(5)) as FromTime, convert(ToTime, char(5)) as ToTime,IP, Status, StatusName, StatusUpdatedByUserName, fn_getFormattedDateTime(StatusUpdatedOn, 0) as StatusUpdatedOn, StatusUpdatedRemarks as Remarks'
    sQry = sQry + " from vw_gettimesheetentrydetails"

    if ProjectName != "" and ProjectName is not None:
      sCond = sCond + ' and ProjectId = "' + ProjectName + '"'

    if EmployeeName != "" and EmployeeName is not None:
      sCond = sCond + ' and EmployeeId = "' + EmployeeName + '"'
    
    if Status != "" and Status is not None:
        sCond = sCond + ' and Status = "' + Status + '"'

    if FromDate != "" and FromDate is not None:
        sCond = sCond + ' and Date >= "' + FromDate + '"'

    if ToDate != "" and ToDate is not None:
        sCond = sCond + ' and Date <= "' + ToDate + '"'
    
    sCond = sCond + ' and ManagerId = "' + ManagerId + '"'

    sCond = sCond + ' and CompanyId = "' + CompanyId + '"'

    sQry = sQry + ' where ' + sCond
    print(sQry)

    timesheetapproval = cur.execute(sQry)

    if timesheetapproval > 0:
        timesheetapproval_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200

# ApproveReject TimeSheetEntry API

@app.route("/timesheetentry/approveRejectTimeSheetEntry", methods=["POST"])
@token_required
def ApproveReject_TimeSheetEntry():
    # Retrieve data posted to the API
    data = request.get_json()

    TimeSheetId = data["TimeSheetId"]
    # ProjectId = data["ProjectId"]
    Status = data["Status"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]
    StatusUpdatedBy = data["StatusUpdatedBy"]

    cur = mysql.connection.cursor()

    print('calling SP_ApprovedRejecteTimeSheetEntry')

    cur.callproc("SP_ApprovedRejecteTimeSheetEntry", (TimeSheetId, Status, StatusUpdatedRemarks, StatusUpdatedBy))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Approving Time Sheet"}), 500
    else:
        return jsonify({"RtnFlag": True, "RtnMsg": "Time sheet Approved Successfully"}), 200

# ApproveReject For LeaveApplication API
@app.route("/leaveapplication/approveRejectForLeaveApplication", methods=["POST"])
@token_required
def ApproveReject_LeaveApplication():
    # Retrieve data posted to the API
    data = request.get_json()

    ApplicationId = data["ApplicationId"]
    # ProjectId = data["ProjectId"]
    Status = data["Status"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]
    StatusUpdatedBy = data["StatusUpdatedBy"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_AppoveRejectLeaveApplication", (ApplicationId, Status, StatusUpdatedRemarks, StatusUpdatedBy))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    rtnMsg = result[0][1]

    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": "Leave Application Approved Successfully"}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500

    #get User List From sp

@app.route("/user/getSelectionUserRoleDropDown")
@token_required
def get_SelectionUserRoleDropDown():
    cur = mysql.connection.cursor()
   
    cur.execute("select RoleId,RoleName from gl_userrole_m where UserTypeId=1")

    projects_data = cur.fetchall()

    # print(projects_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]


    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    userrole_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(userrole_json)[0]["RoleId"])
   
    userrole_json = json.loads(userrole_json);

    users = [
        {"value": user["RoleId"], "label": user["RoleName"]}
        for user in userrole_json
    ]

    return users, 200


@app.route("/user/getUserList", methods=["GET"])
@token_required
def get_UserLists():
   
    cur = mysql.connection.cursor()
   
    UserId = request.args.get("UserId")
    UserName = request.args.get("UserName")
    Status = request.args.get("Status")

    cur.callproc("Ts_Sp_GetUserList", [UserId,UserName,Status])

    data = cur.fetchall()

    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in data]

    result = json.dumps(data)

    print (result)

    cur.close()

    return result, 200
 
# update User STatus Acitve or inactive

@app.route("/user/updateUserStatus", methods=["POST"])
def updateUser_status():
    try:
        data = request.get_json()

        UserId = data["UserId"]
        status = data["status"]
        statusUpdatedRemarks = data["statusUpdatedRemarks"]
        statusUpdatedBy = data["statusUpdatedBy"]

        cur = mysql.connection.cursor()

        cur.callproc("SP_UpdateUserStatus", (UserId, status, statusUpdatedRemarks, statusUpdatedBy))
        result = cur.fetchall()

        rtnFlag = result[0][0]

        if rtnFlag == 1:
            return jsonify({"success": True, "message": "User status updated successfully"}), 200
        else:
            return jsonify({"success": False, "message": "Error updating User status"}), 500

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": "Error updating User status. Error: " + str(e)}), 500

    finally:
        if 'cur' in locals():
            cur.close()


# Insert Users

@app.route("/user/insertUser", methods=["POST"])
@token_required
def insert_User():
    try:
        cur = mysql.connection.cursor()
        # Retrieving Data Posted to API
        data = request.get_json()
       
        UserName = data["UserName"]
        FullName = data["FullName"]
        UserRole = data["UserRole"]
        MobileNumber = data["MobileNumber"]
        EmailId = data["EmailId"]
        CreatedBy = data["CreatedBy"]

        print("getting User roleName",UserRole)

        cur.callproc("SP_InsertUser", (UserName, FullName, UserRole, MobileNumber ,EmailId , CreatedBy))

        result = cur.fetchall()

        RtnFlag = result[0][0]


        print("RtnFlag : " + str(RtnFlag))


        if RtnFlag == 0:
            print("RtnFlag = 0")
            return jsonify({"RtnFlag": False, "RtnMsg": "Error While Saving User"}), 500
        else:
            print("RtnFlag = 1")
            return jsonify({"RtnFlag": True, "RtnMsg": "User Created successfully"}), 201


    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")


        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Saving User. Error : " + str(e)}), 500


    finally:
        cur.close()



# Updated Users

@app.route("/user/updateUser", methods=["POST"])
@token_required
def update_User():
    try:
        # Retrieving Data Posted to API
        cur = mysql.connection.cursor()


        data = request.get_json()


        UserId = data["UserId"]
        UserName = data["UserName"]
        FullName = data["FullName"]
        UserRole = data["UserRole"]
        MobileNumber = data["MobileNumber"]
        EmailId = data["EmailId"]
        ModifiedBy = data["CreatedBy"]


        print("getting user id : ",UserId)
        print("getting username : ",UserName)
        print("getting full name : ",FullName)
        print("getting user role : ",UserRole)
        print("getting mobile number : ",MobileNumber)
        print("getting email id : ",EmailId)
        print("getting created and modified by : ",ModifiedBy)






        cur.callproc("SP_UpdateUser", (UserId, UserName, FullName, UserRole, MobileNumber, EmailId , ModifiedBy))


        result = cur.fetchall()


        rtnFlag = result[0][0]
        print("rtnFlag : " + str(rtnFlag))
        if rtnFlag == 0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag": False, "RtnMsg": "Error While Updating Task"}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag": True, "RtnMsg": "User Updated successfully"}), 201
       
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"RtnFlag": False, "RtnMsg": f"Error while Updating User. Error : {str(e)}"}), 500


    finally:
        cur.close()

@app.route("/profile/getSystemAdminProfileDetails/<UserId>")
def get_SystemAdminProfileDetails(UserId):


    cur = mysql.connection.cursor()

    to_json = []
   
    if int(UserId) > 0:

        cities = cur.execute('select UserId, FullName, UserName, UserRoleName, MobileNumber, EmailId,UserStatus, UserStatusCode from vw_getuserdetails where userId = ' + UserId)
    else:
        cities = cur.execute('select UserId, FullName, UserName, UserRoleName, MobileNumber, EmailId,UserStatus, UserStatusCode from vw_getuserdetails')
       
    if cities > 0:

        city_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200

# Get Filtered Users
@app.route("/user/getFilteredUsers")
def get_FilteredUser():
    UserName = request.args.get("UserName")
    Status = request.args.get("Status")

    cur = mysql.connection.cursor()

    to_json = []
   
    sCond ='1=1'
   
    sQry = 'select UserId, UserName, EmployeeName, EmployeeMobileNo, EmployeeEmailId, fn_getFormattedDateTime(UserCreatedOn, 0) as CreatedOnFormatted, UserStatus from vw_getuserdetails'

    if UserName != "" and UserName is not None:
        # users = cur.execute('select UserId, UserName, EmployeeName, EmployeeMobileNo, EmployeeEmailId, fn_getFormattedDateTime(UserCreatedOn, 0) as CreatedOnFormatted, UserStatus from vw_getuserdetails where UserName = "' + UserName + '"')
        sCond = sCond + ' and UserName = "' + UserName + '"'
    # else:
        # users = cur.execute('select UserId, UserName, EmployeeName, EmployeeMobileNo, EmployeeEmailId, fn_getFormattedDateTime(UserCreatedOn, 0) as CreatedOnFormatted, UserStatus from vw_getuserdetails')

    if Status != "" and Status is not None:
        sCond = sCond + ' and UserStatusCode = "' + Status + '"'

    sQry = sQry + ' where ' + sCond
    print(sQry)

    users = cur.execute(sQry)

    if users > 0:
        user_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200

@app.route("/profile/UpdateSystemAdminProfileData", methods = ["POST"])
def UpdateSystemAdminProfiledata():

    # Retrieving Data Posted to API
    cur = mysql.connection.cursor()
    data = request.get_json()
   
    # print('UpdateEmployee API Called')

    UserId = data["UserId"]
    FullName = data["FullName"]
    MobileNumber = data["MobileNumber"]
    EmailId = data["EmailId"]
   
    # print('calling SP_UpdateProfileData')
    cur.callproc("SP_UpdateSystemAdminProfileData",(UserId, FullName, MobileNumber, EmailId))  

    print('getting result')

    result = cur.fetchall()

    rtnFlag = result[0][0]
    print("rtnFlag : " + str(rtnFlag))

    if rtnFlag==0:
        print("rtnFlag = 0")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Updating User Profile"}), 500
    else:
        print("rtnFlag = 1")

        return jsonify({"RtnFlag" : True, "RtnMsg": "User Profile Updated successfully"}), 201

# User Login API
@app.route("/user/login", methods=["POST"])
def user_login():
    try:
        # Retrieving data posted to API
        data = request.get_json()
        username = data["username"]
        password = data["password"]
        Ip = data["Ip"]    

        cur = mysql.connection.cursor()
        # Calling the stored procedure for user login
        cur.callproc("SP_UserLogin", (username, password, Ip))
        result = cur.fetchall()
        print(result)

        # Checking the result from the stored procedure
        rtnFlag = result[0][0]
        RtnMsg = result[0][1]
       
        # Constructing the response based on the result
        if rtnFlag == 0:
            return jsonify({"RtnFlag": False, "RtnMsg": RtnMsg}), 500
        else:
            # Extracting UserId, EmployeeId, EmployeeName, UserRoleId, and UserRoleName from the result
            user_id = result[0][2]
            employee_id = result[0][3]
            employee_name = result[0][4]
            user_role_id = result[0][5]
            user_role_name = result[0][6]
            session_id = result[0][7]
            Password = result[0][8]
            CompanyId = result[0][9]
            TaskAutoStartEndDateTime = result[0][10]
            CompanyName = result[0][11]
            CurrencyId = result[0][12]
            TimeSheet = result[0][13]
            IssueTracking = result[0][14]
            AttendanceProcess = result[0][15]
            PayRoll = result[0][16]
            MeetingManagement = result[0][17]
            AutoPresentOnLogin = result[0][18]
            AutoAttendanceAutTimeOnLogin = result[0][19]
            AutoStartTimeOnTaskStart = result[0][20]
            AutoEndDateTimeOnTaskEnd = result[0][21]
            AllowPastTimeSheetEntry = result[0][22]
            AllowEditingTimeSheetEntry = result[0][23]
            UserTypeId = result[0][24]
            SelectedLanguageCode = result[0][25]
            SelectedLanguage = result[0][26]
            NatureOfBussinessid = result[0][27]

            token = encode_auth_token(username)


            if isinstance(token, bytes):
                token = token.decode('utf-8')  # Ensure token is a string


            return jsonify({
                "RtnFlag": True,
                "RtnMsg": "LoggedIn Successfully",
                "Token" : token,
                "UserId": user_id,
                "EmployeeId": employee_id,
                "EmployeeName": employee_name,
                "UserRoleId": user_role_id,
                "UserRoleName": user_role_name,
                "SessionId": session_id,
                "Password": Password,
                "CompanyId": CompanyId,
                "TaskAutoStartEndDateTime": TaskAutoStartEndDateTime,
                "CompanyName": CompanyName,
                "CurrencyId": CurrencyId,
                "TimeSheet": TimeSheet,
                "IssueTracking": IssueTracking,
                "AttendanceProcess": AttendanceProcess,
                "PayRoll": PayRoll,
                "MeetingManagement": MeetingManagement,
                "AutoPresentOnLogin": AutoPresentOnLogin,
                "AutoAttendanceAutTimeOnLogin": AutoAttendanceAutTimeOnLogin,
                "AutoStartTimeOnTaskStart": AutoStartTimeOnTaskStart,
                "AutoEndDateTimeOnTaskEnd": AutoEndDateTimeOnTaskEnd,
                "AllowPastTimeSheetEntry":AllowPastTimeSheetEntry,
                "AllowEditingTimeSheetEntry":AllowEditingTimeSheetEntry,
                "UserTypeId":UserTypeId,
                "SelectedLanguageCode":SelectedLanguageCode,
                "SelectedLanguage":SelectedLanguage,
                "NatureOfBussinessid":NatureOfBussinessid,
                

            }), 200


    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": "Error while processing the request"}), 500


    finally:
        if 'cur' in locals():
            cur.close()


#  Forget Password

@app.route("/user/ForgetPassword", methods=["POST"])
def reset_password():
    data = request.get_json()
   
    Username = data.get("newUsername")
   
    if not Username:
        return jsonify({"success": False, "message": "Invalid request parameters"}), 400

    cur = mysql.connection.cursor()
   
    cur.callproc("SP_CheckUserForSendingPassword", [Username])  
   
    result = cur.fetchall()

    # Extracting the results
    rtnFlag = result[0][0]
    UserId = result[0][2]
   
    if rtnFlag == 0:
        print("rtnFlag = 0")
        return jsonify({"RtnFlag": False, "RtnMsg": "Error While sending mail","RtnRefId" : 0}), 500
    else:
        print("rtnFlag = 1")
        return jsonify({"RtnFlag": True, "RtnMsg": "Email send successfully","RtnRefId" : UserId}), 201

# Reset Change Password
@app.route("/user/ChangePassword", methods=["POST"])
def change_password():
    try:
        data = request.get_json()

        UserId = data.get("UserId")
        OldPassword = data.get("OldPassword")
        NewPassword = data.get("NewPassword")

        cur = mysql.connection.cursor()

        cur.callproc("SP_ChangePassword", (UserId, OldPassword, NewPassword))
        result = cur.fetchone()
        cur.close()

        rtnFlag = result[0]

        if rtnFlag == 1:
            # Password change successful
            return jsonify({"success": True, "message": "Password updated successfully"}), 200
        else:
            # Password change failed
            return jsonify({"Failed": False, "message": result[0][1]}), 400

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": f"Error occurred: {str(e)}"}), 500


# LoggedOut User
@app.route("/user/LoggedOut", methods = ["POST"])
@token_required
def update_LogOut():
    try:
        # Retrieving Data Posted to API
        print("user_logout api called")

        # Retrieving Data Posted to API
        # print('getting parameter')
        
        data = request.get_json()

        UserId = data["UserId"]
        SessionId = data["SessionId"]
        
        # print('UserId : ' + str(UserId))
        # print('SessionId : ' + str(SessionId))

        cur = mysql.connection.cursor()
        
        # print('Calling SP_UserLoggedOut stored procedure')

        cur.callproc("SP_UserLoggedOut", (UserId, SessionId))

        # print('End Calling SP_UserLoggedOut stored procedure')


        result = cur.fetchone()
        print(result)
        
        rtnFlag = result[0]
        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")

            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Updating Logging out "}), 500
        else:
            print("rtnFlag = 1")

            # By Sandhi Gurung - 31-May-2024 (For adding token to blacklist)
            print('Deactivating Token')
            auth_header = request.headers.get('Authorization')
    
            token = auth_header.split(" ")[1]
            token_blacklist.add(token)

            print('End Deactivating Token')
            # End Sandhi Code

            return jsonify({"RtnFlag" : True, "RtnMsg": "Update Logged Out successfully"}), 200
   
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"flag" : False, "message": "Error while Logging out. Error : " + str(e)}), 500
   
    finally:
        cur.close()

# Department APIs

#get Department List
@app.route("/department/getDepartments/<DepartmentId>")
def get_Department(DepartmentId):
    cur = mysql.connection.cursor()

    to_json = []
    
    if int(DepartmentId) > 0:
        departments = cur.execute('select DepartmentId, DepartmentCode, DepartmentName, fn_getFormattedDateTime(CreatedOn, 0) as CreateOnFormatted from gl_department_m where departmentid = ' + DepartmentId)
    else:
        departments = cur.execute('select DepartmentId, DepartmentCode, DepartmentName, fn_getFormattedDateTime(CreatedOn, 0) as CreateOnFormatted from gl_Department_m')

    if departments > 0:
        department_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
        
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200

# Inserting Department
@app.route("/department/insertDepartmentOld", methods = ["POST"])
def insert_DepartmentOld():
    try:
        data = request.get_json()

        DepartmentId = data["DepartmentId"]
        DepartmentCode = data["DepartmentCode"]
        DepartmentName = data["DepartmentName"]
        CreatedBy = data["CreatedBy"]

        cur = mysql.connection.cursor()

        cur.execute("INSERT INTO gl_department_m (DepartmentId, DepartmentCode, DepartmentName, CreatedBy, CreatedOn, ModifiedBy, ModifiedOn) VALUES (%s, %s, %s, %s, %s, %s, %s)", (DepartmentId, DepartmentCode, DepartmentName, CreatedBy, datetime.now(), CreatedBy, datetime.now()))
        # cur.execute("INSERT INTO tempBrand (BrandId, BrandName) VALUES(%s, %s)", ('3', "Mahindra"))

        mysql.connection.commit()

        return True
   
    except Exception as e:
        mysql.connection.rollback()
        print("Error: {str(e)}")

        return False
    finally:
        cur.close()

# Inserting Department
@app.route("/department/insertDepartment", methods = ["POST"])
def insert_Department():
    try:
        # Retrieving Data Posted to API
        data = request.get_json()

        DepartmentCode = data["DepartmentCode"]
        DepartmentName = data["DepartmentName"]
        CreatedBy = data["UserId"]

        cur = mysql.connection.cursor()

        print('calling SP_InsertDepartment')

        cur.callproc("SP_InsertDepartment", (DepartmentCode, DepartmentName, CreatedBy))
        # result = cur.stored_results().fetchone()[2]

        print('getting result')

        result = cur.fetchall()

        # print(result)
        # print(result[0][0])

        rtnFlag = result[0][0]
        
        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving Department"}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag" : True, "RtnMsg": "Department saved successfully"}), 201
       
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Saving Department. Error : " + str(e)}), 500
   
    finally:
        cur.close()

# Updating Department
        
@app.route("/department/updateDepartment", methods = ["POST"])
def update_Department():
    try:
        # Retrieving Data Posted to API
        data = request.get_json()

        DepartmentId = data["DepartmentId"]
        DepartmentCode = data["DepartmentCode"]
        DepartmentName = data["DepartmentName"]
        ModifiedBy = data["UserId"]

        cur = mysql.connection.cursor()

        print('calling SP_UpdateDepartment')

        cur.callproc("SP_UpdateDepartment", (DepartmentId, DepartmentCode, DepartmentName, ModifiedBy))

        print('getting result')

        result = cur.fetchall()

        # print(result)
        # print(result[0][0])

        rtnFlag = result[0][0]
        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")

            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Updating Department"}), 500
        else:
            print("rtnFlag = 1")

            return jsonify({"RtnFlag" : True, "RtnMsg": "Department Updated successfully"}), 201
   
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")


        return jsonify({"flag" : False, "message": "Error while Updating Department. Error : " + str(e)}), 500
   
    finally:
        cur.close()

# Designation List
        
@app.route("/designation/getDesignations/<DesignationId>")
def get_Designation(DesignationId):

    cur = mysql.connection.cursor()

    to_json = []
   
    if int(DesignationId) > 0:
        designations = cur.execute('select DesignationId, DesignationCode, DesignationName, fn_getFormattedDateTime(CreatedOn, 0) as CreateOnFormatted from gl_designation_m where designationid = ' + DesignationId)
    else:
        designations = cur.execute('select DesignationId, DesignationCode, DesignationName, fn_getFormattedDateTime(CreatedOn, 0) as CreateOnFormatted from gl_Designation_m')
       
    if designations > 0:
        designation_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200

# Inserting Designation
@app.route("/designation/insertDesignation", methods = ["POST"])
def insert_Designation():
    try:
        # Retrieving Data Posted to API
        data = request.get_json()

        DesignationCode = data["DesignationCode"]
        DesignationName = data["DesignationName"]
        CreatedBy = data["UserId"]

        cur = mysql.connection.cursor()

        print('calling SP_InsertDepartment')

        cur.callproc("SP_InsertDesignation", (DesignationCode, DesignationName, CreatedBy))
        # result = cur.stored_results().fetchone()[2]

        print('getting result')

        result = cur.fetchall()

        # print(result)
        # print(result[0][0])

        rtnFlag = result[0][0]
        
        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving Designation"}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag" : True, "RtnMsg": "Designation saved successfully"}), 201
       
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")


        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Saving Designation. Error : " + str(e)}), 500
   
    finally:
        cur.close()
# Updating Designation
        
@app.route("/designation/updateDesignation", methods = ["POST"])
def update_Designation():
    try:
        # Retrieving Data Posted to API

        data = request.get_json()

        DesignationId = data["DesignationId"]
        DesignationCode = data["DesignationCode"]
        DesignationName = data["DesignationName"]
        ModifiedBy = data["UserId"]
        
        cur = mysql.connection.cursor()

        print('calling SP_UpdateDesignation')

        cur.callproc("SP_UpdateDesignation", (DesignationId, DesignationCode, DesignationName, ModifiedBy))

        print('getting result')

        result = cur.fetchall()

        # print(result)
        # print(result[0][0])

        rtnFlag = result[0][0]
        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")

            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Updating Designation"}), 500
        else:
            print("rtnFlag = 1")

            return jsonify({"RtnFlag" : True, "RtnMsg": "Designation Updated successfully"}), 201
   
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"flag" : False, "message": "Error while Updating Designation. Error : " + str(e)}), 500
   
    finally:
        cur.close()


# DepartmentDropDown

@app.route("/department/getDepartmentForDropDown")


def get_DepartmentDropDown():

    cur = mysql.connection.cursor()

    cur.execute('SELECT DepartmentId , DepartmentName FROM gl_department_m')

    Department_data = cur.fetchall()

    # print(projects_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    department_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(department_json)[0]["DepartmentId"])
   
    department_json = json.loads(department_json)


    department = [
        {"value": departments["DepartmentId"], "label": departments["DepartmentName"]}
        for departments in department_json
    ]
    return department, 200

# DesignationDropDown
@app.route("/designation/getDesignationForDropDown/<CategoryId>")

def get_DesignationDropDown(CategoryId):

    print('CategoryId')
   
    print(CategoryId)

    cur = mysql.connection.cursor()

    if CategoryId=="undefined":
        CategoryId = 0

    cur.execute("SELECT DesignationId , DesignationName FROM gl_designation_m where CategoryId = " + str(CategoryId))

    Designation_data = cur.fetchall()

    print(Designation_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
   
    designation_json = json.dumps(data)
   
    designation_json = json.loads(designation_json)

    designaitons = [
        {"value": designations["DesignationId"], "label": designations["DesignationName"]}
        for designations in designation_json
    ]
    return designaitons, 200

# DesignationDropDown withour paramter or all designation
@app.route("/designation/getAllDesignationForDropDown")

def get_AllDesignationDropDown():

    cur = mysql.connection.cursor()

    cur.execute("SELECT DesignationId , DesignationName FROM gl_designation_m")

    Designation_data = cur.fetchall()

    print(Designation_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
   
    designation_json = json.dumps(data)
   
    designation_json = json.loads(designation_json)

    designaitons = [
        {"value": designations["DesignationId"], "label": designations["DesignationName"]}
        for designations in designation_json
    ]
    return designaitons, 200

# City DropDown
@app.route("/city/getCityForDropDown/<StateId>")
def get_CityDropDown(StateId):
    print('StateId:', StateId)  # Combined print statements for readability

    cur = mysql.connection.cursor()

    if StateId == "undefined":
        StateId = 0

    # Use parameterized queries to prevent SQL injection
    cur.execute("SELECT CityId, CityName FROM gl_city_m WHERE StateId = %s", (StateId,))

    City_data = cur.fetchall()
    print(City_data)

    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in City_data]

    # Create the city dropdown list
    city = [{"value": None, "label": "Other City"}]  # Add "OtherCity" at the beginning
    city.extend([
        {"value": cities["CityId"], "label": cities["CityName"]}
        for cities in data
    ])
    return city, 200

# CountryDropDown
@app.route("/country/getCountryForDropDown")
def get_CountryDropDown():
    cur = mysql.connection.cursor()

    cur.execute("SELECT CountryId , CountryName FROM gl_country_m")

    State_data = cur.fetchall()

    # print(State_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
   
    State_data = json.dumps(data)
   
    State_data = json.loads(State_data)

    state = [
        {"value": states["CountryId"], "label": states["CountryName"]}
        for states in State_data
    ]
    return state, 200

# State Option with CountryId DropDown
@app.route("/State/getStateForDropDown/<CountryId>")

def get_StateDropDownWithCountry(CountryId):

    cur = mysql.connection.cursor()

    if CountryId=="undefined":
        CountryId = 0

    cur.execute("SELECT StateId , StateName FROM gl_state_m where CountryId = " + str(CountryId))

    City_data = cur.fetchall()

    print(City_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
   
    City_data = json.dumps(data)
   
    City_data = json.loads(City_data)

    city = [
        {"value": cities["StateId"], "label": cities["StateName"]}
        for cities in City_data
    ]
    return city, 200

# SatateDropDown
@app.route("/state/getStateForDropDown/")

def get_StateDropDown():

    cur = mysql.connection.cursor()

    # if CountryId=="undefined":
    #     CountryId = 1

    cur.execute("SELECT StateId , StateName FROM gl_state_m where CountryId = 1")

    State_data = cur.fetchall()

    # print(State_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
   
    State_data = json.dumps(data)
   
    State_data = json.loads(State_data)

    state = [
        {"value": states["StateId"], "label": states["StateName"]}
        for states in State_data
    ]
    return state, 200

# StatusDropDownForEmployee

@app.route("/status/getEmployeeStatusForDropDown")

def get_EmployeeStatusDropDown():

    cur = mysql.connection.cursor()
   
    cur.execute('SELECT StatusCode , StatusName FROM gl_status_m where StatusFor="Employee"')

    EmployeeStatus_data = cur.fetchall()

    # print(projects_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    employeestatus_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(employeestatus_json)[0]["StatusCode"])
   
    employeestatus_json = json.loads(employeestatus_json)

    employees = [
        {"value": employeestatus["StatusCode"], "label": employeestatus["StatusName"]}
        for employeestatus in employeestatus_json
    ]
    return employees, 200

# ManagerDfropDoen

@app.route("/manager/getManagerForDropDown/<CompanyId>")
def get_ManagerDropDown(CompanyId):
    cur = mysql.connection.cursor()
    
    if CompanyId == "undefined":
        CompanyId = 1
    
    query = '''
        SELECT EmployeeId, EmployeeName 
        FROM vw_getemployeedetails 
        WHERE CompanyId = %s 
          AND RoleId IN (6,3)
    '''
    
    cur.execute(query, (CompanyId,))

    Manager_data = cur.fetchall()

    rows = [x for x in Manager_data]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    manager_json = json.dumps(data)
   
    manager_json = json.loads(manager_json)

    managers = [
        {"value": manager["EmployeeId"], "label": manager["EmployeeName"]}
        for manager in manager_json
    ]
    return jsonify(managers), 200
        
# Project List
        
@app.route("/project/getProjects/<ProjectId>")
def get_Project(ProjectId):
    cur = mysql.connection.cursor()

    to_json = []
   
    if int(ProjectId) > 0:
        projects = cur.execute('select ProjectId, ProjectCode, ProjectName, ProjectDesc, CustomerId, CustomerName, ProjectCost, ProjectDuration, DurationType, fn_getFormattedDateTime(TargetStartDate, 0) as TargetStartDateFormatted, DATE_FORMAT(TargetStartDate, "%Y-%m-%d") as StartDateFormatted ,fn_getFormattedDateTime(TargetEndDate, 0) as TargetEndDateFormatted, DATE_FORMAT(TargetEndDate, "%Y-%m-%d") as EndDateFormatted,  StatusName ,Status, StatusUpdatedByFullName, fn_getFormattedDateTime(StatusUpdatedOn, 0) as StatusUpdatedOn, StatusUpdatedRemarks from vw_getprojectdetails where projectid = ' + ProjectId)
    else:
        projects = cur.execute('select ProjectId, ProjectCode, ProjectName, ProjectDesc, CustomerId, CustomerName, ProjectCost, ProjectDuration, DurationType, fn_getFormattedDateTime(TargetStartDate, 0) as TargetStartDateFormatted, DATE_FORMAT(TargetStartDate, "%Y-%m-%d") as StartDateFormatted ,fn_getFormattedDateTime(TargetEndDate, 0) as TargetEndDateFormatted, DATE_FORMAT(TargetEndDate, "%Y-%m-%d") as EndDateFormatted,  StatusName ,Status, StatusUpdatedByFullName, fn_getFormattedDateTime(StatusUpdatedOn, 0) as StatusUpdatedOn, StatusUpdatedRemarks from vw_getprojectdetails')
       
    if projects > 0:
        project_data = cur.fetchall()
        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)
    return to_json, 200

#   this is api for filter for Project


@app.route("/project/getFilteredProjects")
def get_FilteredProject():
    CompanyId = request.args.get("CompanyId")
    CustomerId = request.args.get("CustomerId")
    Status = request.args.get("Status")
    TargetStartDate = request.args.get("TargetStartDate")
    TargetEndDate = request.args.get("TargetEndDate")


    cur = mysql.connection.cursor()
    to_json = []


    # Start with a base condition that is always true
    sCond = '1=1'


    # Base query without WHERE clause
    sQry = ('SELECT ProjectId, ProjectCode, ProjectName, ProjectDesc, CustomerId,textColor,BackgroundColor, CustomerName, '
            'ProjectCost,Cost, ProjectDuration, DurationType, '
            'fn_getFormattedDateTime(TargetStartDate, 0) as TargetStartDateFormatted, '
            'DATE_FORMAT(TargetStartDate, "%Y-%m-%d") as StartDateFormatted, '
            'fn_getFormattedDateTime(TargetEndDate, 0) as TargetEndDateFormatted, '
            'DATE_FORMAT(TargetEndDate, "%Y-%m-%d") as EndDateFormatted, StatusName, Status, '
            'StatusUpdatedByFullName, fn_getFormattedDateTime(StatusUpdatedOn, 0) as StatusUpdatedOn, '
            'StatusUpdatedRemarks FROM vw_getprojectdetails')

    # Add conditions based on the provided parameters
    if CompanyId:
        sCond += " AND CompanyId = " + CompanyId

    if CustomerId:
        sCond += ' AND CustomerId = "' + CustomerId + '"'

    if Status:
        sCond += ' AND Status = "' + Status + '"'

    if TargetStartDate:
        sCond += ' AND TargetStartDate >= "' + TargetStartDate + '"'

    if TargetEndDate:
        sCond += ' AND TargetEndDate <= "' + TargetEndDate + '"'

    # Combine the query with the condition and order by clause
    sQry += ' WHERE ' + sCond + ' ORDER BY StatusUpdatedOn DESC'
   
    print(sQry)  # For debugging purposes

    projects = cur.execute(sQry)

    if projects > 0:
        project_data = cur.fetchall()
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in project_data]
        to_json = json.dumps(data)

    return to_json, 200

# CustomerDropDown

@app.route("/project/getCustomerNameForDropDown/<CompanyId>")

def get_CustomerNameForDropDown(CompanyId):

    cur = mysql.connection.cursor()
    # print (CompanyId)

    if CompanyId=="undefined":
        CompanyId = 1
   
    cur.execute("SELECT CustomerId, CustomerName FROM gl_customer_m where CompanyId = " + str(CompanyId))

    # cur.execute("SELECT CityId , CityName FROM gl_city_m where StateId = " + str(StateId))

    customers_data = cur.fetchall()

    # print(projects_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    customers_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(customers_json)[0]["CustomerId"])
   
    customers_json = json.loads(customers_json);

    customers = [
        {"value": customer["CustomerId"], "label": customer["CustomerName"]}
        for customer in customers_json
    ]
    return customers, 200

@app.route("/receipts/getCustomerBillToForDropDown/<CustomerId>")
def get_CustomerBillToForDropDown(CustomerId):
    cur = mysql.connection.cursor()

    # if CompanyId == "undefined":
    #     CompanyId = 1

    # Execute the query with parameter substitution
    cur.execute("SELECT InvoiceId, InvoiceNo, BalanceAmt, fn_getFormattedDate(InvoiceDate) AS InvoiceDate, BalanceNoToWord FROM vw_getinvoicedetails WHERE CustomerId = %s AND BalanceAmt > 0 AND Status !='CAN'", (str(CustomerId),))

    # Fetch all rows from the executed query
    customers_data = cur.fetchall()

    # Get column names from the cursor description
    columns = [col[0] for col in cur.description]

    # Create a list of dictionaries from the rows and columns
    data = [dict(zip(columns, row)) for row in customers_data]

    # Format the result into the desired structure
    customers = [
        {"value": customer["InvoiceId"], "label": f'{customer["InvoiceNo"]} ({customer["BalanceAmt"]})', "BalanceAmt": customer["BalanceAmt"], "InvoiceDate": customer["InvoiceDate"], "BalanceNoToWord": customer["BalanceNoToWord"]}
        for customer in data
    ]

    # Close the cursor
    cur.close()


    # Return the formatted result and status code
    return json.dumps(customers), 200


# Project status Dropdown

@app.route("/project/getSelectionStatusDropDown")

def get_ProjectsStatusDropDown():

    cur = mysql.connection.cursor()
   
    cur.execute('SELECT StatusCode as Status, StatusName FROM gl_status_m WHERE StatusFor="Project"')

    projectstatus_data = cur.fetchall()

    # print(projects_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    projectstatus_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(projectstatus_json)[0]["Status"])
   
    projectstatus_json = json.loads(projectstatus_json)

    projects = [
        {"value": projectstatus["Status"], "label": projectstatus["StatusName"]}
        for projectstatus in projectstatus_json
    ]
    return projects, 200


# insertproject API

@app.route("/project/insertProject", methods = ["POST"])
@token_required
def insert_Project():
    try:
        cur = mysql.connection.cursor()
        # Retrieving Data Posted to API
        data = request.get_json()
       
        CustomerId = data["CustomerId"]
        ProjectName = data["ProjectName"]
        ProjectDesc = data["ProjectDesc"]
        ProjectCost = data["ProjectCost"]
        CurrencyId = data["CurrencyId"]
        Duration = data["Duration"]
        DurationType = data["DurationType"]
        CompanyId = data["CompanyId"]
        TargetStartDate = data["TargetStartDate"]
        TargetEndDate = data["TargetEndDate"]
        CreatedBy = data["UserId"]
        LocationListData = data["LocationListData"]

        Location_json = json.dumps(LocationListData)

        print('CompanyId',CompanyId)
        print('TargetStartDate',TargetStartDate)
        print("DurationType", DurationType)
        print("LocationListData",Location_json)

        print("getting project data soon",data)
        cur.callproc("SP_InsertProject", (CustomerId, ProjectName, ProjectDesc, ProjectCost, CurrencyId, Duration, DurationType, CompanyId, TargetStartDate, TargetEndDate, CreatedBy, Location_json))
        # result = cur.stored_results().fetchone()[2]
        # print(CreatedBy)
       
        print('getting result')

        result = cur.fetchall()

        rtnFlag = result[0][0]
        ProjectId = result[0][2]
       
        print("rtnFlag : " + str(rtnFlag))


        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving Project","RtnRefId" : 0}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag" : True, "RtnMsg": "Project saved successfully","RtnRefId" : ProjectId}), 201
       
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")


        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Saving Project. Error : " + str(e)}), 500
   
    finally:
        cur.close()

# Updating Project
       
@app.route("/project/updateProject", methods = ["POST"])
@token_required
def update_Project():
    try:
        # Retrieving Data Posted to API

        cur = mysql.connection.cursor()

        data = request.get_json()

        ProjectId = data["ProjectId"]
        # ProjectCode = data["ProjectCode"]
        CustomerId = data["CustomerId"]
        ProjectName = data["ProjectName"]
        ProjectDesc = data["ProjectDesc"]
        ProjectCost = data["ProjectCost"]
        Duration = data["Duration"]
        DurationType = data["DurationType"]
        CompanyId = data["CompanyId"]
        TargetStartDate = data["TargetStartDate"]
        TargetEndDate = data["TargetEndDate"]
        ModifiedBy = data["UserId"]
        LocationListData = data["LocationListData"]

        Location_json = json.dumps(LocationListData)
       
        print('calling SP_UpdateProject')

        cur.callproc("SP_UpdateProject", ( ProjectId, CustomerId, ProjectName, ProjectDesc, ProjectCost, Duration, DurationType,CompanyId, TargetStartDate, TargetEndDate, ModifiedBy, Location_json))

        print('getting result')

        result = cur.fetchall()

        rtnFlag = result[0][0]
        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")

            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Updating Project"}), 500
        else:
            print("rtnFlag = 1")
       
            return jsonify({"RtnFlag" : True, "RtnMsg": "Project Updated successfully"}), 201
   
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")
       
        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Updating Project. Error : " + str(e)}), 500
   
    finally:
        cur.close()


    # Project History API


@app.route("/project/getProjectHistoryDetails")
def get_Project_History():

    ProjectId = request.args.get("ProjectId")
    # try:
    cur = mysql.connection.cursor()

    print('calling history sp')
   
    cur.callproc("SP_getProjectHistoryDetails", [ProjectId])

    print('fetching history data')
    history_details = cur.fetchall()

    print('history fetched')
    print(history_details)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    print(data)

    return to_json, 200

# SP To get Customer Branch List

@app.route("/customer/getCustomerBranchList", methods = ["POST"])
def get_CustomerBranchList():

    data = request.get_json()

    CustomerId = data["CustomerId"]
    print(CustomerId)

    cur = mysql.connection.cursor()

    cur.callproc("SP_getCustomerBranchList", (CustomerId,))

    history_details = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]

    to_json = json.dumps(data)

    return to_json, 200

# View Customer List For Print

@app.route("/customer/getViewCustomerListForPrint", methods=['GET'])
@token_required
def get_viewCustomerDetailsForPrint():

    CustomerId = request.args.get("CustomerId")
   
    if not CustomerId:
        return jsonify({"error": "CustomerId parameter is required"}), 400

    try:
        with mysql.connection.cursor() as cur:
            cur.callproc("SP_getCustomerDetailsForPrint", [CustomerId])
            columns = [col[0] for col in cur.description]
            rows = cur.fetchall()
            data = [dict(zip(columns, row)) for row in rows]
           
            print(data)

            return jsonify(data), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


# customer branch API

@app.route("/customer/InsertCustomerBranch", methods = ["POST"])
@token_required
def insert_CustomerBranch():
    # Retrieving Data Posted to API
    data = request.get_json()

    CustomerId = data["CustomerId"]
    BranchName = data["BranchName"]
    Address1 = data["Address1"]
    Address2 = data["Address2"]
    CountryName = data["CountryName"]
    StateId = data["StateId"]
    CityId = data["CityId"]
    OtherCityName = data["OtherCityName"]
    PinCode = data["PinCode"]
    Landmark = data["Landmark"]
    ContactNumber = data["ContactNumber"]
    ContactPersonTitle = data["ContactPersonTitle"]
    ContactPerson = data["ContactPerson"]
    EmailId = data["EmailId"]
    UserId = data["UserId"]

    cur = mysql.connection.cursor()

    OtherCityName = data["OtherCityName"]
    cur.callproc("SP_InsertCustomerBranch", (CustomerId, BranchName, Address1, Address2,CountryName, StateId, CityId, OtherCityName, PinCode, Landmark, ContactNumber, ContactPersonTitle, ContactPerson,EmailId,UserId))
    # result = cur.stored_results().fetchone()[2]

    result = cur.fetchall()

    rtnFlag = result[0][0]
    BranchId = result[0][2]

    if rtnFlag==0:
        print("rtnFlag = 0")
        return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving Customer Branch" ,"RtnRefId" : 0}), 500
    else:
        print("rtnFlag = 1")
        return jsonify({"RtnFlag" : True, "RtnMsg": "Congratulation!!! You Have Been successfully Inserted  Branch." ,"RtnRefId" : BranchId}), 201

# Update Customer Branch

@app.route("/customer/UpdateCustomerBranch", methods = ["POST"])
def Update_CustomerBranch():
    # Retrieving Data Posted to API
    data = request.get_json()

    BranchId = data["BranchId"]
    BranchName = data["BranchName"]
    Address1 = data["Address1"]
    Address2 = data["Address2"]
    CountryName = data["CountryName"]
    StateId = data["StateId"]
    CityId = data["CityId"]
    OtherCityName = data["OtherCityName"]
    PinCode = data["PinCode"]
    Landmark = data["Landmark"]
    ContactNumber = data["ContactNumber"]
    ContactPersonTitle = data["ContactPersonTitle"]
    ContactPerson = data["ContactPerson"]
    EmailId = data["EmailId"]
    UserId = data["UserId"]
   
    cur = mysql.connection.cursor()

    cur.callproc("SP_UpdateCustomerBranch", (BranchId, BranchName, Address1, Address2, CountryName, StateId, CityId, OtherCityName , PinCode, Landmark, ContactNumber, ContactPersonTitle, ContactPerson, EmailId, UserId))
    # result = cur.stored_results().fetchone()[2]

    result = cur.fetchall()

    rtnFlag = result[0][0]

    if rtnFlag==0:
        print("rtnFlag = 0")
        return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Update Customer Branch"}), 500
    else:
        print("rtnFlag = 1")
        return jsonify({"RtnFlag" : True, "RtnMsg": "Congratulation!!! You Have Been successfully Update Customer Branch Data."}), 201


# getCustomerList

@app.route("/customer/getCustomers/<CustomerId>")
def get_CustomerList(CustomerId):

    cur = mysql.connection.cursor()

    to_json = []
   
    if int(CustomerId) > 0:
        customers = cur.execute('select CustomerId, CustomerCode, CustomerName, Address1 ,Address2, CityName, CityId, StateName, StateId, PinCode, Landmark, ContactNumber,ContactPersonTitle,ContactPerson, EmailId, Outstanding, TotalBranch, StatusName, StatusCode, StatusUpdatedByFullName, fn_getFormattedDateTime(StatusUpdatedOn, 0) as StatusUpdatedOnFormatted  ,StatusUpdatedRemarks from vw_getcustomerdetails where customerId = ' + CustomerId)
    else:
        customers = cur.execute('select CustomerId, CustomerCode, CustomerName, Address1 ,Address2, CityName, CityId, StateName, StateId, PinCode, Landmark, ContactNumber,ContactPersonTitle,ContactPerson, EmailId, Outstanding, TotalBranch, StatusName, StatusCode, StatusUpdatedByFullName, fn_getFormattedDateTime(StatusUpdatedOn, 0) as StatusUpdatedOnFormatted  ,StatusUpdatedRemarks from vw_getcustomerdetails')
       
    if customers > 0:
        customer_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200

# Insert Customer

@app.route("/customer/insertCustomer", methods = ["POST"])
@token_required
def insert_Customer():
    try:
        cur = mysql.connection.cursor()
        data = request.get_json()

        CompanyId = data["CompanyId"]
        CustomerName = data["CustomerName"]
        Address1 = data["Address1"]
        Address2 = data["Address2"]
        CountryName = data["CountryName"]
        StateName = data["StateName"]
        CityName = data["CityName"]
        OtherCityName = data["OtherCityName"]
        PinCode = data["PinCode"]
        Landmark = data["Landmark"]
        ContactNumber = data["ContactNumber"]
        ContactPersonTitle = data["ContactPersonTitle"]
        ContactPerson = data["ContactPerson"]
        GSTNo = data["GSTNo"]
        EmailId = data["EmailId"]
        CreatedBy = data["UserId"]  
        
        cur.callproc("SP_InsertCustomer", (CompanyId, CustomerName, Address1, Address2, CountryName, StateName, CityName, OtherCityName, PinCode,Landmark, ContactNumber, ContactPersonTitle, ContactPerson,GSTNo, EmailId, CreatedBy))

        print("got data after inserted",data)   
        
        result = cur.fetchall()
        rtnFlag = result[0][0]
        CustomerId = result[0][2]
        print("getting insert result",result)
        print("rtnFlag : " + str(rtnFlag))
        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving Customer","RtnRefId" : 0}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag" : True, "RtnMsg": "Customer saved successfully","RtnRefId" : CustomerId}), 201
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Saving Customer. Error : " + str(e)}), 500
   
    finally:
        cur.close()

        # Update Cusotomer

@app.route("/customer/updateCustomer", methods = ["POST"])
@token_required
def update_Customer():
    try:
     
        cur = mysql.connection.cursor()

        data = request.get_json()

        CompanyId = data["CompanyId"]
        CustomerId = data["CustomerId"]
        CustomerName = data["CustomerName"]
        Address1 = data["Address1"]
        Address2 = data["Address2"]
        CountryName = data["CountryName"]
        StateName = data["StateName"]
        CityName = data["CityName"]
        OtherCityName = data["OtherCityName"]
        PinCode = data["PinCode"]
        Landmark = data["Landmark"]
        ContactNumber = data["ContactNumber"]
        ContactPersonTitle = data["ContactPersonTitle"]
        ContactPerson = data["ContactPerson"]
        GSTNo = data["GSTNo"]
        EmailId = data["EmailId"]
        ModifiedBy = data["UserId"]
              
        print(data)
        print('calling SP_UpdateCustomer')
       
        cur.callproc("SP_UpdateCustomer",( CompanyId,CustomerId, CustomerName, Address1, Address2, CountryName, StateName, CityName,OtherCityName, PinCode, Landmark, ContactNumber,ContactPersonTitle, ContactPerson,GSTNo, EmailId, ModifiedBy))

        print('getting result')

        result = cur.fetchall()

        rtnFlag = result[0][0]
        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")
            msg = result[0][1]
            return jsonify({"RtnFlag" : False, "RtnMsg": msg}), 500
        else:
            print("rtnFlag = 1")

            return jsonify({"RtnFlag" : True, "RtnMsg": "Customer Updated successfully"}), 201
   
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Updating Customer. Error : " + str(e)}), 500
   
    finally:
        cur.close()


        #Filter For Customer

@app.route("/customer/getFilteredCustomer", methods=['GET'])
def get_FilteredCustomer():
    cur = mysql.connection.cursor()

    StateId = request.args.get("StateId")
    CityId = request.args.get("CityId")
    StatusCode = request.args.get("StatusCode")
    CompanyId = request.args.get("CompanyId")


    to_json = []
   
    sCond = '1=1'
   
    sQry = '''
        SELECT
            CustomerId, CustomerName, CustomerCode, Address1, Address2,
            CityId, CityName, OtherCityName,CountryId,CountryName, StateId, StateName, PinCode, Landmark,
            ContactPerson, ContactNumber, EmailId, TotalBranch,
            Outstanding,GSTNo, StatusName, ContactPersonTitle, StatusCode,
            StatusUpdatedByFullName, fn_getFormattedDateTime(StatusUpdatedOn, 0) as StatusUpdatedOnFormatted,
            StatusUpdatedRemarks
        FROM vw_getcustomerdetails
    '''
   
    if CompanyId:
        sCond += " AND CompanyId = " + CompanyId

    if StateId:
        sCond += ' AND StateId = "' + StateId + '"'

    if CityId:
        sCond += ' AND CityId = "' + CityId + '"'

    if StatusCode:
        sCond += ' AND StatusCode = "' + StatusCode + '"'  

    sQry += ' WHERE ' + sCond + ' ORDER BY StatusUpdatedOn DESC'
    print(sQry)


    cur.execute(sQry)
    CustomerFiltered_data = cur.fetchall()

    if CustomerFiltered_data:
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in CustomerFiltered_data]
        to_json = json.dumps(data)

    return to_json, 200

# City List

@app.route("/city/getCities/<CityId>")
def get_CityList(CityId):

    cur = mysql.connection.cursor()

    to_json = []
   
    if int(CityId) > 0:

        cities = cur.execute('select CityId, CityCode, CityName, StateId, StateName from vw_getcitydetails where cityId = ' + CityId)
    else:
        cities = cur.execute('select CityId, CityCode, CityName, StateId, StateName from vw_getcitydetails')
       
    if cities > 0:

        city_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200

    # Used In City Master

@app.route("/State/getStateDropDownUsedInCity")
def get_StateDropDownUsedInCity():

    cur = mysql.connection.cursor()
    cur.execute("SELECT StateId , StateName FROM gl_state_m")
    City_data = cur.fetchall()
    print(City_data)
    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
   
    City_data = json.dumps(data)
   
    City_data = json.loads(City_data)

    city = [
        {"value": cities["StateId"], "label": cities["StateName"]}
        for cities in City_data
    ]
    return city, 200


# Insert City

@app.route("/city/insertCity", methods = ["POST"])
def insert_City():
    try:
        cur = mysql.connection.cursor()

        # Retrieving Data Posted to API
        data = request.get_json()
       
        CityCode = data["CityCode"]
        CityName = data["CityName"]
        StateId = data["StateId"]
        CreatedBy = data["UserId"]

        cur.callproc("SP_InsertCity", (CityCode, CityName, StateId, CreatedBy))
        print('getting result')
        result = cur.fetchall()
        rtnFlag = result[0][0]
       
        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving City"}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag" : True, "RtnMsg": "City saved successfully"}), 201
       
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Saving City. Error : " + str(e)}), 500
   
    finally:
        cur.close()

        # Update City
@app.route("/city/updateCity", methods = ["POST"])
def update_City():
    try:
        # Retrieving Data Posted to API
        cur = mysql.connection.cursor()
        data = request.get_json()

        CityId = data["CityId"]
        CityCode = data["CityCode"]
        CityName = data["CityName"]
        StateId = data["StateId"]
        ModifiedBy = data["UserId"]
       
        print('calling SP_UpdateCity')
       
        cur.callproc("SP_UpdateCity", (CityId, CityCode, CityName, StateId, ModifiedBy))

        print('getting result')

        result = cur.fetchall()

        rtnFlag = result[0][0]

        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")

            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Updating City"}), 500
        else:
            print("rtnFlag = 1")

            return jsonify({"RtnFlag" : True, "RtnMsg": "City Updated successfully"}), 201
   
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Updating City. Error : " + str(e)}), 500
   
    finally:
        cur.close()
# State List
 
@app.route("/state/getStates/<StateId>")
def get_StateList(StateId):

    cur = mysql.connection.cursor()

    to_json = []
   
    if int(StateId) > 0:

        states = cur.execute('select StateId, StateCode, StateName, CountryId, CountryName from vw_getstatedetails where stateId = ' + StateId)
    else:
        states = cur.execute('select StateId, StateCode, StateName, CountryId, CountryName from vw_getstatedetails')
       
    if states > 0:

        state_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200


# Insert State

@app.route("/state/insertState", methods = ["POST"])
def insert_State():
    try:
        cur = mysql.connection.cursor()

        # Retrieving Data Posted to API
        data = request.get_json()
       
        StateCode = data["StateCode"]
        StateName = data["StateName"]
        CountryId = data["CountryId"]
        CreatedBy = data["UserId"]

        print("getting state data by arun",data)
        cur.callproc("SP_InsertState", (StateCode, StateName,CountryId, CreatedBy))

        print('getting result')

        result = cur.fetchall()

        rtnFlag = result[0][0]
       
        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving State"}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag" : True, "RtnMsg": "State saved successfully"}), 201
       
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Saving Country. Error : " + str(e)}), 500
   
    finally:
        cur.close()

        # Update State
@app.route("/state/updateState", methods = ["POST"])
def update_State():
    try:
        # Retrieving Data Posted to API
        cur = mysql.connection.cursor()

        data = request.get_json()

        StateId = data["StateId"]
        StateCode = data["StateCode"]
        StateName = data["StateName"]
        CountryId = data["CountryId"]
        ModifiedBy = data["UserId"]
       
        print('calling SP_UpdateState')
       
        cur.callproc("SP_UpdateState", (StateId,StateCode, StateName,CountryId, ModifiedBy))

        print('getting result')

        result = cur.fetchall()

        rtnFlag = result[0][0]

        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")

            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Updating State"}), 500
        else:
            print("rtnFlag = 1")

            return jsonify({"RtnFlag" : True, "RtnMsg": "State Updated successfully"}), 201
   
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Updating State. Error : " + str(e)}), 500
   
    finally:
        cur.close()
# Country List
        
@app.route("/country/getCountries/<CountryId>")
def get_CountryList(CountryId):

    cur = mysql.connection.cursor()

    to_json = []
   
    if int(CountryId) > 0:
        countries = cur.execute('select CountryId, CountryCode, CountryName from vw_getcountrydetails where countryId = ' + CountryId)
    else:
        countries = cur.execute('select CountryId, CountryCode, CountryName from vw_getcountrydetails')
       
    if countries > 0:

        country_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200

# InsertCountry


@app.route("/country/insertCountry", methods = ["POST"])
def insert_Country():
    try:
        cur = mysql.connection.cursor()

        # Retrieving Data Posted to API
        data = request.get_json()

        CountryCode = data["CountryCode"]
        CountryName = data["CountryName"]
        CreatedBy = data["UserId"]

        cur.callproc("SP_InsertCountry", (CountryCode, CountryName, CreatedBy))

        print('getting result')

        result = cur.fetchall()

        rtnFlag = result[0][0]
       
        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving Country"}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag" : True, "RtnMsg": "Country saved successfully"}), 201
       
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Saving Country. Error : " + str(e)}), 500
   
    finally:
        cur.close()

# Update Country
       
@app.route("/country/updateCountry", methods = ["POST"])
def update_Country():
    try:
        # Retrieving Data Posted to API
        cur = mysql.connection.cursor()
        data = request.get_json()

        CountryId = data["CountryId"]
        CountryCode = data["CountryCode"]
        CountryName = data["CountryName"]
        ModifiedBy = data["UserId"]
       
        print('calling SP_UpdateCountry')
        cur.callproc("SP_UpdateCountry", (CountryId, CountryCode, CountryName, ModifiedBy))
        print('getting result')
        result = cur.fetchall()
        rtnFlag = result[0][0]

        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Updating Country"}), 500
        else:
            print("rtnFlag = 1")

            return jsonify({"RtnFlag" : True, "RtnMsg": "Country Updated successfully"}), 201
   
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")


        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Updating Country. Error : " + str(e)}), 500
   
    finally:
        cur.close()
# Holiday List

@app.route("/holiday/getHolidays/<Id>")
def get_HolidayList(Id):

    cur = mysql.connection.cursor()

    to_json = []
   
    if int(Id) > 0:

        holidays = cur.execute('select Id, fn_getFormattedDate(HolidayDate) as HolidayDateFormatted, DATE_FORMAT(HolidayDate, "%Y-%m-%d") as HolidayFormattedDate, HolidayName,  Description, CreatedByFullName, fn_getFormattedDateTime(HolidayCreatedOn , 0) as CreatedOnFormatted, ModifiedByFullName, fn_getFormattedDateTime(LastModifiedDate , 0) as ModifiedOnFormatted from vw_getholidaydetails where id = ' + Id)
    else:
        holidays = cur.execute('select Id, fn_getFormattedDate(HolidayDate) as HolidayDateFormatted, DATE_FORMAT(HolidayDate, "%Y-%m-%d") as HolidayFormattedDate, HolidayName, Description, CreatedByFullName, fn_getFormattedDateTime(HolidayCreatedOn , 0) as CreatedOnFormatted, ModifiedByFullName, fn_getFormattedDateTime(LastModifiedDate , 0) as ModifiedOnFormatted from vw_getholidaydetails')
       
    if holidays > 0:

        holiday_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200

# Insert Holiday

@app.route("/holiday/insertHoliday", methods = ["POST"])
def insert_Holiday():
    try:
        cur = mysql.connection.cursor()

        # Retrieving Data Posted to API
        data = request.get_json()
       

        CompanyId = data["CompanyId"]
        HolidayDate = data["HolidayDate"]
        HolidayName = data["HolidayName"]
        HolidayType = data["HolidayType"]
        OptionalHoliday = data["OptionalHoliday"]
        Description = data["Description"]
        CreatedBy = data["UserId"]

        cur.callproc("SP_InsertHoliday", (CompanyId,HolidayDate, HolidayName, HolidayType,OptionalHoliday, Description, CreatedBy))

        print('getting result')

        result = cur.fetchall()

        rtnFlag = result[0][0]
       
        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving Holiday"}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag" : True, "RtnMsg": "Holiday saved successfully"}), 201
       
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Saving Holiday. Error : " + str(e)}), 500
   
    finally:
        cur.close()

        # Update Holiday

@app.route("/holiday/updateHoliday", methods = ["POST"])
def update_Holiday():
    try:
        # Retrieving Data Posted to API

        cur = mysql.connection.cursor()

        data = request.get_json()

        Id = data["Id"]
        HolidayDate = data["HolidayDate"]
        HolidayName = data["HolidayName"]
        HolidayType = data["HolidayType"]
        OptionalHoliday = data["OptionalHoliday"]
        Description = data["Description"]
        ModifiedBy = data["UserId"]
       
        print('calling SP_UpdateHoliday')
       
        cur.callproc("SP_UpdateHoliday", (Id, HolidayDate, HolidayName, HolidayType, OptionalHoliday, Description, ModifiedBy))

        print('getting result')

        result = cur.fetchall()

        rtnFlag = result[0][0]

        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")

            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Updating Holiday"}), 500
        else:
            print("rtnFlag = 1")

            return jsonify({"RtnFlag" : True, "RtnMsg": "Holiday Updated successfully"}), 201
   
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Updating Holiday. Error : " + str(e)}), 500
   
    finally:
        cur.close()


# Holiday Filter


@app.route("/holiday/getHolidayFilter", methods=["POST"])
def Filter_Holiday():
    data = request.get_json()
   
    HolidayYear = data["HolidayYear"]
    CompanyId = data["CompanyId"]

    cur = mysql.connection.cursor()

    # print("Calling SP")
    # print('Holiday Year : ' + str(HolidayYear))

    cur.callproc("SP_getHolidayFilter", [HolidayYear,CompanyId])
    print("End SP")
    data = cur.fetchall()
    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)
    return to_json, 200

# Project Approve Reject API
        
@app.route("/project/approveRejectForProject", methods=["POST"])
def ApproveReject_Project():
    # Retrieve data posted to the API
    data = request.get_json()

    ProjectId = data["ProjectId"]
    # ProjectId = data["ProjectId"]
    Status = data["Status"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]
    StatusUpdatedBy = data["StatusUpdatedBy"]

    cur = mysql.connection.cursor()

    print('calling SP_ApprovedRejectProject')

    cur.callproc("SP_ApprovedRejectProject", (ProjectId, Status, StatusUpdatedRemarks, StatusUpdatedBy))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Approving Project"}), 500
    else:
        return jsonify({"RtnFlag": True, "RtnMsg": "Project Approved Successfully"}), 200

# Project Approval History API
        
@app.route("/projectApproval/getProjectApprovalHistoryDetails")
def get_Project_HistoryDetails():

    ProjectId = request.args.get("ProjectId")
    # try:
    cur = mysql.connection.cursor()

    print('calling history sp')
   
    cur.callproc("SP_getProjectHistoryDetails", [ProjectId])

    print('fetching history data')
    history_details = cur.fetchall()

    print('history fetched')
    print(history_details)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)
    print(data)
    return to_json, 200    


#   this is api for filter for ProjectApproval
@app.route("/projectapproval/getFilteredProjectApprovals")
def get_FilteredProjectApproval():
    Status = request.args.get("Status")
    # Status = data["Status"]

    # CompanyId = data["CompanyId"]
    CompanyId = request.args.get("CompanyId")

    cur = mysql.connection.cursor()
    to_json = []
    sCond ='1=1'

    sQry =  'select ProjectId, ProjectName,ProjectCode, CustomerName, ProjectCost, ProjectDuration, DurationType, fn_getFormattedDateTime(TargetStartDate, 0) as TargetStartDateFormatted, fn_getFormattedDateTime(TargetEndDate, 0) as TargetEndDateFormatted, Status, StatusName, ProjectCreatedByUserName as CreatedBy, fn_getFormattedDateTime(ProjectCreatedOn, 0) as CreatedOn, StatusUpdatedByUserName, fn_getFormattedDateTime(StatusUpdatedOn, 0) as StatusUpdatedOn, StatusUpdatedRemarks as Remarks from vw_getprojectdetails'


    sCond = " CompanyId = " + CompanyId

    if Status != "" and Status is not None:
        sCond = sCond + ' and Status = "' + Status + '"'

    else:
        sCond = sCond + ' and Status = "N"'
    sQry = sQry + ' where ' + sCond
    print(sQry)

    projectapprovals = cur.execute(sQry)

    if projectapprovals > 0:
        projectapproval_data = cur.fetchall()


        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)


    return to_json, 200


# UpdateStatus For Project Status API
@app.route("/project/updateProjectStatus", methods=["POST"])
def update_project_status():
    try:
        data = request.get_json()

        ProjectId = data["ProjectId"]
        status = data["status"]
        statusUpdatedRemarks = data["statusUpdatedRemarks"]
        statusUpdatedBy = data["statusUpdatedBy"]

        cur = mysql.connection.cursor()

        cur.callproc("SP_UpdateProjectStatus", (ProjectId, status, statusUpdatedRemarks, statusUpdatedBy))
        result = cur.fetchall()

        rtnFlag = result[0][0]

        if rtnFlag == 1:
            return jsonify({"success": True, "message": "Project status updated successfully"}), 200
        else:
            return jsonify({"success": False, "message": "Error updating project status"}), 500

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": "Error updating project status. Error: " + str(e)}), 500

    finally:
        if 'cur' in locals():
            cur.close()

# Create User
@app.route("/project/createProject", methods = ["POST"])
def create_Project():
    data = request.get_json()
    return jsonify(data), 201

# Get Filtered Leave Application
@app.route("/leaveapplication/getFilteredLeaveApplications")
@token_required
def get_FilteredLeaveApplication():
    LeaveCode = request.args.get("LeaveCode")
    LeaveType = request.args.get("LeaveType")
    Status = request.args.get("Status")
    FromDate = request.args.get("FromDate")
    ToDate = request.args.get("ToDate")
    EmployeeId = request.args.get("EmployeeId")
    CompanyId = request.args.get("CompanyId")
    

    cur = mysql.connection.cursor()

    to_json = []
   
    sCond ='1=1'
   
    sQry = 'select EmployeeId, EmployeeName, ApplicationId, ApplicationDateFormated as ApplicationDate, fn_getFormattedDate(FromDate) as FromDate, DATE_FORMAT(FromDate, "%Y-%m-%d") as FromDateFormated, DATE_FORMAT(ToDate, "%Y-%m-%d") as ToDateFormated, fn_getFormattedDate(ToDate) as ToDate, LeaveCode, LeaveName,LeaveType, LeaveTypeName, NoOfDays, ApplicationDescription, StatusName, StatusUpdatedBy, StatusUpdatedOn, StatusUpdatedRemarks'
    sQry = sQry + " from vw_getleaveapplicationdetails"

    if LeaveCode != "" and LeaveCode is not None:
      sCond = sCond + ' and LeaveCode = "' + LeaveCode + '"'

    if LeaveType != "" and LeaveType is not None:
      sCond = sCond + ' and LeaveType = "' + LeaveType + '"'
    
    if Status != "" and Status is not None:
        sCond = sCond + ' and Status = "' + Status + '"'

    if FromDate != "" and FromDate is not None:
        sCond = sCond + ' and ApplicationDate >= "' + FromDate + '"'

    if ToDate != "" and ToDate is not None:
        sCond = sCond + ' and ApplicationDate <= "' + ToDate + '"'

    sCond = sCond + ' and EmployeeId = "' + EmployeeId + '"'
    sCond = sCond + ' and CompanyId = "' + CompanyId + '"'


    sQry = sQry + ' where ' + sCond + ' ORDER BY ApplicationId DESC'
    # print(sQry)

    LeaveapplicatinFiltered = cur.execute(sQry)

    if LeaveapplicatinFiltered > 0:
        LeaveapplicatinFiltered_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200

# Inserting LeaveApplication
@app.route("/leaveapplication/insertLeaveApplication", methods = ["POST"])
@token_required
def insert_LeaveApplication():
    try:
        # Retrieving Data Posted to API
        data = request.get_json()

        cur = mysql.connection.cursor()

        CompanyId = data["CompanyId"]
        EmployeeId = data["EmployeeId"]
        LeaveCode = data["LeaveCode"]
        LeaveType = data["LeaveType"]
        FromDate = data["FromDate"]
        ToDate = data["ToDate"]
        NoOfDays = data["NoOfDays"]
        Description  = data["Description"]
        CreatedBy = data["UserId"]

        print('calling SP_InsertLeaveApplication')


        cur.callproc("SP_InsertLeaveApplication", (CompanyId, EmployeeId, LeaveCode, LeaveType, FromDate, ToDate, str(NoOfDays), Description, CreatedBy))
        # result = cur.stored_results().fetchone()[2]


        # print('a' + LeaveCode + 'b')
        # print("SP_InsertLeaveApplication " + str(EmployeeId) + ", '" +  LeaveCode + "', '" + LeaveType + "', '" + FromDate + "', '" + ToDate + "', " + str(NoOfDays) + ", '" + Description + "', " + str(CreatedBy))
        # # print("SP_InsertLeaveApplication " + type(str(EmployeeId)) + ", '" + LeaveCode + "', '" + LeaveType + "', '" + FromDate + "', '" + ToDate + "', " + type(str(NoOfDays)) + ", '" + Description + "', " + type(str(CreatedBy)))

        # print('getting result')


        result = cur.fetchall()


        rtnFlag = result[0][0]
        applicationId = result[0][2]

        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving Leave Application", "RtnRefId" : 0}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag" : True, "RtnMsg": "Leave Application saved successfully", "RtnRefId" : applicationId}), 201
       
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")


        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Saving Leave Application. Error : " + str(e)}), 500
   
    finally:
        cur.close()

# Updating LeaveApplication
@app.route("/leaveapplication/updateLeaveApplication", methods = ["POST"])
@token_required
def update_LeaveApplication():
    try:
        # Retrieving Data Posted to API

        data = request.get_json()

        # print("updateTimeSheetEntry Api Called")

        cur = mysql.connection.cursor()

        ApplicationId = data["ApplicationId"]
        LeaveCode = data["LeaveCode"]
        LeaveType = data["LeaveType"]
        FromDate = data["FromDate"]
        ToDate = data["ToDate"]
        NoOfDays = data["NoOfDays"]
        Description  = data["Description"]
        ModifiedBy = data["UserId"]
        
        print('calling SP_LeaveApplication')

        cur.callproc("SP_UpdateLeaveApplication", (ApplicationId, LeaveCode, LeaveType, FromDate, ToDate, NoOfDays, Description, ModifiedBy))
        
        # print('SP_UpdateTimeSheetEntry Called')


        result = cur.fetchall()


        # print(result)
        # print(result[0][0])


        rtnFlag = result[0][0]
        print("rtnFlag : " + str(rtnFlag))


        if rtnFlag==0:
            print("rtnFlag = 0")


            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Updating Leave Application"}), 500
        else:
            print("rtnFlag = 1")


            return jsonify({"RtnFlag" : True, "RtnMsg": "Leave Application Updated successfully"}), 201
   
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Updating Leave Application. Error : " + str(e)}), 500
   
    finally:
        cur.close()

# Get Filtered Leave Application Approval
@app.route("/leaveapplication/getFilteredLeaveApplicationApprovals")
@token_required
def get_FilteredLeaveApplicationApproval():
    LeaveCode = request.args.get("LeaveCode")
    LeaveType = request.args.get("LeaveType")
    Status = request.args.get("Status")
    FromDate = request.args.get("FromDate")
    ToDate = request.args.get("ToDate")
    ManagerId = request.args.get("ManagerId")
    EmployeeId = request.args.get("EmployeeId")
    CompanyId = request.args.get("CompanyId")

    cur = mysql.connection.cursor()

    to_json = []
   
    sCond ='1=1'
   
    sQry = 'select ApplicationId,  fn_getFormattedDateTime(ApplicationDate, 0) as ApplicationDate, EmployeeName, fn_getFormattedDate(FromDate) as FromDate, DATE_FORMAT(FromDate, "%Y-%m-%d") as FromDateFormated, DATE_FORMAT(FromDate, "%Y-%m-%d") as ToDateFormated, fn_getFormattedDate(ToDate) as ToDate, LeaveCode, LeaveName,LeaveType, LeaveTypeName, NoOfDays, ApplicationDescription,Status, StatusName, StatusUpdatedBy, StatusUpdatedOn, StatusUpdatedRemarks'
    sQry = sQry + " from vw_getleaveapplicationdetails"

    if LeaveCode != "" and LeaveCode is not None:
      sCond = sCond + ' and LeaveCode = "' + LeaveCode + '"'

    if LeaveType != "" and LeaveType is not None:
      sCond = sCond + ' and LeaveType = "' + LeaveType + '"'
    
    if Status != "" and Status is not None:
        sCond = sCond + ' and Status = "' + Status + '"'

    if FromDate != "" and FromDate is not None:
        sCond = sCond + ' and ApplicationDate >= "' + FromDate + '"'

    if ToDate != "" and ToDate is not None:
        sCond = sCond + ' and ApplicationDate <= "' + ToDate + '"'

    if EmployeeId != 0 and EmployeeId != "0" and EmployeeId is not None:
      sCond = sCond + ' and EmployeeId = "' + EmployeeId + '"'

    sCond = sCond + ' and ManagerId = "' + ManagerId + '"'
    sCond = sCond + ' and CompanyId = "' + CompanyId + '"'

    sQry = sQry + ' where ' + sCond + ' ORDER BY ApplicationId DESC'
    print(sQry)

    LeaveapplicatinApprovalFiltered = cur.execute(sQry)

    if LeaveapplicatinApprovalFiltered > 0:
        LeaveapplicatinApprovalFiltered_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200

# employeeList API Starts Here

@app.route("/employee/getEmployees/<EmployeeId>")

def get_Employee(EmployeeId):
    cur = mysql.connection.cursor()

    to_json = []
   
    if int(EmployeeId) != 0:
        employees = cur.execute('select EmployeeId, EmployeeName, Experience, ExpType, Qualification, Address1, Address2, CityId, CityName, StateId, StateName, PinCode, AdharNumber, PanNumber, PassportNumber,EmployeeEmailId, EmployeeMobileNo, EmployeeGender, fn_getFormattedDate(employeeDOB) as DateOfBirthFormated, DATE_FORMAT(employeeDOB, "%Y-%m-%d") as DateOfBirth, employeeMaritalStatus, EmployeeDepartmentId, EmployeeDepartmentName, CategoryId, CategoryName, EmployeeDesignationId, EmployeeDesignationName, EmployeeManagerId, EmployeeManagerName, EmployeeStatusCode, EmployeeStatus from vw_getemployeedetails where employeeid = ' + EmployeeId)
    else:
        employees = cur.execute('select EmployeeId, EmployeeName,Experience,ExpType,Qualification, Address1, Address2, CityId, CityName, StateId, StateName, PinCode, AdharNumber, PanNumber, PassportNumber,EmployeeEmailId, EmployeeMobileNo, EmployeeGender, fn_getFormattedDate(employeeDOB) as DateOfBirthFormated, DATE_FORMAT(employeeDOB, "%Y-%m-%d") as DateOfBirth, employeeMaritalStatus, EmployeeDepartmentId, EmployeeDepartmentName, CategoryId, CategoryName, EmployeeDesignationId, EmployeeDesignationName, EmployeeManagerId, EmployeeManagerName, EmployeeStatusCode, EmployeeStatus from vw_getemployeedetails')
       
    if employees > 0:

        employee_data = cur
        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)
       
    return to_json, 200

# Employee Filter

@app.route("/employee/getFilteredEmployee")

def getEmployeeFilter():

    cur = mysql.connection.cursor()
   
    CompanyId =  request.args.get("CompanyId")
    CategoryId = request.args.get("CategoryId")
    EmployeeGender = request.args.get("EmployeeGender")
    employeeMaritalStatus = request.args.get("employeeMaritalStatus")
    EmployeeDepartmentId = request.args.get("EmployeeDepartmentId")
    EmployeeDesignationId = request.args.get("EmployeeDesignationId")
    EmployeeManagerId = request.args.get("EmployeeManagerId")
    CityId = request.args.get("CityId")
    StateId = request.args.get("StateId")
    EmployeeStatusCode =  request.args.get("EmployeeStatusCode")


    to_json = []
   
    sCond ='1=1'
   
    sQry = 'select EmployeeId,EmployeeName,Address1,EmployeeMobileNo,fn_getFormattedDate(DateOfJoining) as DateOfJoining,BasicSalary,EmployeeManagerName,EmployeeStatus  ,EmployeeTitle,EmployeeGender,employeeMaritalStatus , DATE_FORMAT(AnniversaryDate, "%Y-%m-%d") as AnniversaryDate, fn_getFormattedDate(employeeDOB) as DateOfBirthFormated,DATE_FORMAT(employeeDOB, "%Y-%m-%d") as DateOfBirth,'
    sQry = sQry + ' EmployeeCode,EmployeeUserName,  Address2, CityId, CityName,OtherCityName, CountryId, CountryName, StateId, StateName, Landmark, EmployeeEmailId,EmployeeDesignationId,EmployeeDesignationName,EmployeeDepartmentId, '
    sQry = sQry + 'EmployeeDepartmentName,CategoryId, CategoryName,SalaryType,EmployeeManagerId,EmployeeFirstName,EmployeeMiddleName,'
    sQry = sQry + 'EmployeeLastName,Experience, ExpType, Qualification, DATE_FORMAT(DateOfJoining, "%Y-%m-%d") as DateOfJoiningFormatted, PinCode,'
    sQry = sQry + ' AdharNumber, PanNumber, PassportNumber, DrivingLicence,'
    sQry = sQry + ' EmployeeStatusCode from vw_getemployeedetails'
   
    sCond = " CompanyId = " + CompanyId

    if CategoryId != "" and CategoryId is not None:
      sCond = sCond + ' and CategoryId = "' + CategoryId + '"'
     
    if EmployeeGender != "" and EmployeeGender is not None:
        sCond = sCond + ' and EmployeeGender = "' + EmployeeGender + '"'

    if employeeMaritalStatus != "" and employeeMaritalStatus is not None:
        sCond = sCond + ' and employeeMaritalStatus = "' + employeeMaritalStatus + '"'

    if EmployeeDepartmentId != "" and EmployeeDepartmentId is not None:
        sCond = sCond + ' and EmployeeDepartmentId = "' + EmployeeDepartmentId + '"'

    if EmployeeDesignationId != "" and EmployeeDesignationId is not None:
        sCond = sCond + ' and EmployeeDesignationId = "' + EmployeeDesignationId + '"'
       
    if EmployeeManagerId != "" and EmployeeManagerId is not None:
        sCond = sCond + ' and EmployeeManagerId = "' + EmployeeManagerId + '"'

    if CityId != "" and CityId is not None:
        sCond = sCond + ' and CityId = "' + CityId + '"'

    if StateId != "" and StateId is not None:
        sCond = sCond + ' and StateId = "' + StateId + '"'

    if EmployeeStatusCode != "" and EmployeeStatusCode is not None:
        sCond = sCond + ' and EmployeeStatusCode = "' + EmployeeStatusCode + '"'

    sQry = sQry + ' where ' + sCond
    print(sQry)

    EmployeeFiltered = cur.execute(sQry)

    if EmployeeFiltered > 0:

        EmployeeFiltered_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]

        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200



#ResignationAcceptAndReject 

@app.route("/employee/EmployeeResignationAcceptReject", methods=["POST"])
@token_required
def Employee_ResignationAcceptReject():
    # Retrieve data posted to the API
    data = request.get_json()


    EmployeeId = data["EmployeeId"]
    Status = data["Status"]
    StatusUpdatedBy = data["StatusUpdatedBy"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]


    cur = mysql.connection.cursor()


    cur.callproc("TS_SP_ResignationAcceptReject", (EmployeeId, Status, StatusUpdatedBy, StatusUpdatedRemarks))
    result = cur.fetchall()


    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)


    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Resignation Accept and Reject"}), 500
    else:
 
        return jsonify({"RtnFlag": True, "RtnMsg": "Resignation Accept and Reject Task Successfully"}), 200

#View Employee List For Print 

@app.route("/employee/getViewEmployeeListForPrint", methods=['GET'])
@token_required
def get_viewEmployeeDetailsForPrint():

    EmployeeId = request.args.get("EmployeeId")
   
    if not EmployeeId:
        return jsonify({"error": "EmployeeId parameter is required"}), 400

    try:
        with mysql.connection.cursor() as cur:
            cur.callproc("SP_getEmployeeDetailsForPrint", [EmployeeId])
            columns = [col[0] for col in cur.description]
            rows = cur.fetchall()
            data = [dict(zip(columns, row)) for row in rows]
           
            # Optionally print the data to console (remove in production)
            print(data)

            return jsonify(data), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


# EmployeeManagerHistory

@app.route("/employee/getEmployeeManagerHistoryDetails")
@token_required
def get_Employee_Manager_History():

    EmployeeId = request.args.get("EmployeeId")
    # try:
    cur = mysql.connection.cursor()

    print('calling history sp')
   
    cur.callproc("SP_getEmployeeManagerHistoryDetails", [EmployeeId])

    print('fetching history data')
    history_details = cur.fetchall()

    print('history fetched')
    print(history_details)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    print(data)

    return to_json, 200


# InsertEmployee API

@app.route("/employee/insertEmployee", methods = ["POST"])
def insert_Employee():
    try:
        # Retrieving Data Posted to API
        cur = mysql.connection.cursor()

        data = request.get_json()
       
        CompanyId = data["CompanyId"]
        EmployeeTitle = data["EmployeeTitle"]
        EmployeeFirstName = data["EmployeeFirstName"]
        EmployeeMiddleName = data["EmployeeMiddleName"]
        EmployeeLastName = data["EmployeeLastName"]
        Gender = data["Gender"]
        DateOfBirth = data["DateOfBirth"]
        MaritalStatus = data["MaritalStatus"]
        AnniversaryDate = data["AnniversaryDate"]
        Address1 = data["Address1"]
        Address2 = data["Address2"]
        CountryName = data["CountryName"]
        EmployeeState = data["EmployeeState"]
        CityId = data["CityId"]
        OtherCityName = data["OtherCityName"]
        PinCode = data["PinCode"]
        Landmark = data["Landmark"]
        EmployeeEmailId = data["EmployeeEmailId"]
        EmployeeMobileNo = data["EmployeeMobileNo"]
        CategoryId = data["CategoryId"]
        EmployeeDesignationRow = data["EmployeeDesignationRow"]
        EmployeeDepartmentRow = data["EmployeeDepartmentRow"]
        EmployeeManagerRow = data["EmployeeManagerRow"]
        DateOfJoining = data["DateOfJoining"]
        AdharNumber = data["AdharNumber"]
        PanNumber = data["PanNumber"]
        DrivingLicence = data["DrivingLicence"]
        PassportNumber = data["PassportNumber"]
        BasicSalary = data["BasicSalary"]
        SalaryType = data["SalaryType"]
        MeetingRatePerHour = data["MeetingRatePerHour"]
        WorkExperience = data["WorkExperience"]
        WorkExperienceType = data["WorkExperienceType"]
        Qualification = data["Qualification"]
        UserId = data["UserId"]

        if AnniversaryDate == '':
            AnniversaryDate = "1900-01-01"
    
        cur.callproc("SP_InsertEmployee", (CompanyId, EmployeeTitle, EmployeeFirstName, EmployeeMiddleName, EmployeeLastName, Gender, DateOfBirth, MaritalStatus, AnniversaryDate,  Address1, Address2,CountryName, EmployeeState, CityId, OtherCityName, PinCode, Landmark, EmployeeEmailId, EmployeeMobileNo, CategoryId, EmployeeDesignationRow, EmployeeDepartmentRow, EmployeeManagerRow, DateOfJoining, AdharNumber, PanNumber, DrivingLicence, PassportNumber, BasicSalary, SalaryType, MeetingRatePerHour, WorkExperience, WorkExperienceType, Qualification, UserId))
        
        print('getting result')

        result = cur.fetchall()

        rtnFlag = result[0][0]
       
        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag==0:
            print("rtnFlag = 0")
            RtnMsg = result[0][1]
            return jsonify({"RtnFlag" : False, "RtnMsg": RtnMsg ,"RtnRefId" : 0}), 500

        if rtnFlag==2:
            print("rtnFlag = 2")
            RtnMsg = result[0][1]
            return jsonify({"RtnFlag" : False, "RtnMsg": RtnMsg ,"RtnRefId" : 0}), 500    
       
        if rtnFlag==3:
            print("rtnFlag = 3")
            RtnMsg = result[0][1]
            return jsonify({"RtnFlag" : False, "RtnMsg": RtnMsg ,"RtnRefId" : 0}), 500   

        else:
            print("rtnFlag = 1")
            EmployeeId = result[0][2]
            return jsonify({"RtnFlag" : True, "RtnMsg": "Employee Detail saved successfully" ,"RtnRefId" : EmployeeId}), 201
       
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Saving Employee. Error : " + str(e)}), 500
   
    finally:
        cur.close()

# Updating Employee API
        
@app.route("/employee/updateEmployee", methods = ["POST"])
@token_required
def update_Employee():
    try:
        # Retrieving Data Posted to API
        cur = mysql.connection.cursor()
        data = request.get_json()
       
        print('UpdateEmployee API Called')
        print(data)

        EmployeeId = data["EmployeeId"]
        EmployeeTitle = data["EmployeeTitle"]
        EmployeeFirstName = data["EmployeeFirstName"]
        EmployeeMiddleName = data["EmployeeMiddleName"]
        EmployeeLastName = data["EmployeeLastName"]
        Gender = data["Gender"]
        DateOfBirth = data["DateOfBirth"]
        MaritalStatus = data["MaritalStatus"]
        AnniversaryDate = data["AnniversaryDate"]
        Address1 = data["Address1"]
        Address2 = data["Address2"]
        CountryName = data["CountryName"]
        EmployeeState = data["EmployeeState"]
        CityId = data["CityId"]
        OtherCityName = data["OtherCityName"]
        PinCode = data["PinCode"]
        Landmark = data["Landmark"]
        EmployeeEmailId = data["EmployeeEmailId"]
        EmployeeMobileNo = data["EmployeeMobileNo"]
        CategoryId = data["CategoryId"]
        EmployeeDesignationRow = data["EmployeeDesignationRow"]
        EmployeeDepartmentRow = data["EmployeeDepartmentRow"]
        EmployeeManagerRow = data["EmployeeManagerRow"]
        DateOfJoining = data["DateOfJoining"]
        AdharNumber = data["AdharNumber"]
        PanNumber = data["PanNumber"]
        DrivingLicence = data["DrivingLicence"]
        PassportNumber = data["PassportNumber"]
        BasicSalary = data["BasicSalary"]
        SalaryType = data["SalaryType"]
        MeetingRatePerHour = data["MeetingRatePerHour"]
        WorkExperience = data["WorkExperience"]
        WorkExperienceType = data["WorkExperienceType"]
        Qualification = data["Qualification"]
        ModifiedBy = data["UserId"]
     
        print('calling SP_UpdateEmployee')
       
        cur.callproc("SP_UpdateEmployee",(EmployeeId, EmployeeTitle, EmployeeFirstName, EmployeeMiddleName, EmployeeLastName, Gender, DateOfBirth, MaritalStatus , AnniversaryDate , Address1, Address2, CountryName,EmployeeState, CityId, OtherCityName,PinCode , Landmark,EmployeeEmailId,EmployeeMobileNo,CategoryId,EmployeeDesignationRow,EmployeeDepartmentRow , EmployeeManagerRow,DateOfJoining,AdharNumber,PanNumber,DrivingLicence, PassportNumber,BasicSalary, SalaryType,MeetingRatePerHour,WorkExperience,WorkExperienceType, Qualification,ModifiedBy))  

        print('getting result')

        result = cur.fetchall()

        rtnFlag = result[0][0]
        rtnMsg = result[0][1]
        print("rtnFlag : " + str(rtnFlag))
        print("rtnMsg" + str(rtnMsg))
        print("gotting the reult by arun ",result )
        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Updating Emploee"}), 500
        else:
            print("rtnFlag = 1")

            return jsonify({"RtnFlag" : True, "RtnMsg": "Employee Updated successfully"}), 201
   
    except Exception as e:

        # mysql.connection.rollback()
        print(f"Error: {str(e)}")

        return jsonify({"flag" : False, "message": "Error while Updating Employee. Error : " + str(e)}), 500
   
    finally:
        cur.close()


# UpdateEmployeeStatus

@app.route("/employee/UpdateEmployeeStatus", methods=["POST"])
@token_required
def update_employee_status():
    try:
        data = request.get_json()

        EmployeeId = data["EmployeeId"]
        Status = data["Status"]
        ResignedOn = data["ResignedOn"]
        ReleavedOn = data["ReleavedOn"]
        TerminatedOn = data["TerminatedOn"]
        ActivatedOn =  data["ActivatedOn"]
        DeactivatedOn = data["DeactivatedOn"]
        SuspendedOn = data["SuspendedOn"]
        SuspendedPeriod = data["SuspendedPeriod"]
        SuspendedTill = data["SuspendedTill"]
        NoticePeriod = "15"
        TentativeLeavingDate = data["TentativeLeavingDate"]
        StatusUpdatedBy = data["StatusUpdatedBy"]
        StatusUpdatedRemarks = data["StatusUpdatedRemarks"]

        if Status == 'R':
            ReleavedOn = None
            TerminatedOn = None
            SuspendedOn = None
            SuspendedTill = None
            ActivatedOn = None
            DeactivatedOn = None
            SuspendedPeriod = None

        elif Status == 'REL':
            ResignedOn = None
            TentativeLeavingDate = None
            TerminatedOn = None
            SuspendedOn = None
            SuspendedPeriod = None
            SuspendedTill = None
            ActivatedOn = None
            DeactivatedOn = None  

        elif Status == 'T':
            ResignedOn = None
            TentativeLeavingDate = None
            ReleavedOn = None
            SuspendedOn = None
            SuspendedPeriod = None
            SuspendedTill = None
            ActivatedOn = None
            DeactivatedOn = None  

        elif Status == 'S':
            ResignedOn = None
            TentativeLeavingDate = None
            TerminatedOn = None
            ReleavedOn = None
            ActivatedOn = None
            DeactivatedOn = None  

        elif Status == 'A':
            ResignedOn = None
            TentativeLeavingDate = None
            TerminatedOn = None
            ReleavedOn = None
            SuspendedOn = None
            SuspendedPeriod = None
            SuspendedTill = None  
            DeactivatedOn = None  

        elif Status == 'D':
            ActivatedOn = None
            ResignedOn = None
            TentativeLeavingDate = None
            TerminatedOn = None
            ReleavedOn = None
            SuspendedOn = None
            SuspendedPeriod  = None
            SuspendedTill = None  
       
        cur = mysql.connection.cursor()

        cur.callproc("Sp_UpdateEmployeeStatus", (EmployeeId, Status, ResignedOn, ReleavedOn, TerminatedOn,ActivatedOn, DeactivatedOn, SuspendedOn, SuspendedPeriod, SuspendedTill, NoticePeriod, TentativeLeavingDate, StatusUpdatedBy, StatusUpdatedRemarks))
        result = cur.fetchall()

        rtnFlag = result[0][0]

        if rtnFlag == 1:
            return jsonify({"success": True, "message": "Employee status updated successfully"}), 200
        else:
            return jsonify({"success": False, "message": "Error updating Employee status"}), 500

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": "Error While updating Employee status. Error: " + str(e)}), 500

    finally:
        if 'cur' in locals():
            cur.close()








@app.route("/task/getMyTaskQA", methods=["GET"])
def get_MyTaskListForQA():
    
    cur = mysql.connection.cursor()
   
    QcEmpId = request.args.get("QcEmpId")
    ProjectId = request.args.get("ProjectId")
    MenuCode = request.args.get("MenuCode")
    SubMenuCode = request.args.get("SubMenuCode")
    TaskTypeId = request.args.get("TaskTypeId")
    TaskStatus = request.args.get("TaskStatus")
    FromDate = request.args.get("FromDate")
    ToDate = request.args.get("ToDate")

    if FromDate == '':
        FromDate = '1990-01-01'

    if ToDate == '':
        ToDate = '1990-01-01'


    # print('TaskAllocatedTo : ' + str(QcEmpId))
    # print('ProjectName : ' + ProjectId)
    # print('MenuName : ' + MenuCode)
    # print('SubMenuName : ' + SubMenuCode)
    # print('TaskTypeName : ' + TaskTypeId)
    # print('TaskStatus : ' + TaskStatus)
    # print('FromDate : ' + FromDate)
    # print('ToDate : ' + ToDate)

    cur.callproc("Ts_Sp_getMyTaskQA", [QcEmpId,ProjectId,MenuCode,SubMenuCode,TaskTypeId,TaskStatus,FromDate,ToDate])

    data = cur.fetchall()

    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in data]

    result = json.dumps(data)

    print (result)
    # print(jsonify(result))

    cur.close()

    return result, 200

# Filtered Task Allocation

@app.route("/taskallocation/getFilteredtaskallocation")
def get_FilteredTaskAllocation():
   
    cur = mysql.connection.cursor()

    ProjectName = request.args.get("ProjectName")
    TaskStatus = request.args.get("TaskStatus")
    FromDate = request.args.get("FromDate")
    ToDate = request.args.get("ToDate")
    CompanyId = request.args.get("CompanyId")
    # ManagerId = request.args.get("ManagerId")

    to_json = []
   
    sCond ='1=1'
   
    sQry = 'select TaskId, TaskName, ProjectId, ProjectName, MenuName, MenuCode, SubMenuCode, SubMenuName, TaskTypeId, TaskTypeName, fn_getFormattedDate(TargetDate) as TargetDateFormat, DATE_FORMAT(TargetDate, "%Y-%m-%d") as TargetDateFormated, TaskStatus, TaskStatusName, TaskAllocatedTo, AllocatedToFullName, fn_getFormattedDateTime(TaskAllocatedOn, 0) as TaskAllocatedOnFormat, DATE_FORMAT(TaskAllocatedOn, "%Y-%m-%d") as TaskAllocatedOnFormated, TaskAllocatedRemarks, fn_getFormattedDate(TaskStartDate) as TaskStartDateFormated, convert(TaskStartTime , char(5)) as TaskStartTimeFormated, TaskStartRemarks, TaskCreatedByFullName, fn_getFormattedDateTime(TaskCreatedOn, 0) as TaskCreatedOnFormated, TaskModifiedByFullName, fn_getFormattedDateTime(LastModifiedDate, 0) as LastModifiedDateFormated, StatusUpdatedByFullName, fn_getFormattedDateTime(StatusUpdatedOn, 0) as StatusUpdatedOnFormated, fn_getFormattedDateTime(TaskEndDate, 0) as TaskEndDateFormated, StatusUpdatedRemarks from ts_vw_gettaskdetails'
    
    sCond = " CompanyId = " + CompanyId
    
    if ProjectName != "0" and ProjectName is not None:
      sCond = sCond + ' and ProjectId = "' + ProjectName + '"'
 
    if TaskStatus != "" and TaskStatus is not None:
        sCond = sCond + ' and TaskStatus = "' + TaskStatus + '"'

    if FromDate != "" and FromDate is not None:
        sCond = sCond + ' and TargetDate >= "' + FromDate + '"'

    if ToDate != "" and ToDate is not None:
        sCond = sCond + ' and TargetDate <= "' + ToDate + '"'

    # sCond = sCond + ' and ManagerId = "' + ManagerId + '"'

    sQry = sQry + ' WHERE ' + sCond + ' ORDER BY TaskId DESC'

    print(sQry)

    TaskAllocationFiltered = cur.execute(sQry)

    if TaskAllocationFiltered > 0:
        TaskAllocationFiltered_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200

# API For INsert and Update For Task Allocation

@app.route("/taskallocation/insertTask", methods=["POST"])
@token_required
def insert_TaskAllocation():
    try:
        cur = mysql.connection.cursor()
        # Retrieving Data Posted to API
        data = request.get_json()

        Task = data["Task"]
        TaskTypeId = data["TaskTypeId"]
        TargetDate = data["TargetDate"]
        Description = data["Description"]
        ProjectId = data["ProjectId"]
        LocationId = data["LocationId"]
        MenuCode = data["MenuCode"]
        SubMenuCode = data["SubMenuCode"]
        CompanyId = data["CompanyId"]
        CreatedBy = data["UserId"]

        cur.callproc("TS_SP_InsertTask", (Task, TaskTypeId, TargetDate, Description, ProjectId, LocationId, MenuCode, SubMenuCode,CompanyId, CreatedBy))

        result = cur.fetchall()

        rtnFlag = result[0][0]
        TaskId = result[0][2]

        print("rtnFlag : " + str(rtnFlag))

        if rtnFlag == 0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag": False, "RtnMsg": "Error While Saving Task","RtnRefId" : 0}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag": True, "RtnMsg": "Task Created successfully","RtnRefId" : TaskId}), 201

    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")


        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Saving TaskAllocation. Error : " + str(e)}), 500

    finally:
        cur.close()


# Updating TaskAllocation
 
@app.route("/taskallocation/updateTask", methods=["POST"])
@token_required
def update_Task():
    try:
        # Retrieving Data Posted to API
        cur = mysql.connection.cursor()


        data = request.get_json()


        TaskId = data["TaskId"]
        Task = data["Task"]
        TaskTypeId = data["TaskTypeId"]
        TargetDate = data["TargetDate"]
        Description = data["Description"]
        ProjectId = data["ProjectId"]
        LocationId = data["LocationId"]
        MenuCode = data["MenuCode"]
        SubMenuCode = data["SubMenuCode"]
        CompanyId = data["CompanyId"]
        ModifiedBy = data["UserId"]


        print('calling Ts_Sp_UpdateTask')


        cur.callproc("Ts_Sp_UpdateTask", (TaskId, Task, TaskTypeId, TargetDate, Description, ProjectId,LocationId, MenuCode, SubMenuCode, CompanyId, ModifiedBy))


        print('getting result')


        result = cur.fetchall()


        rtnFlag = result[0][0]
        print("rtnFlag : " + str(rtnFlag))
        if rtnFlag == 0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag": False, "RtnMsg": "Error While Updating Task"}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag": True, "RtnMsg": "Task Updated successfully"}), 201
       
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"RtnFlag": False, "RtnMsg": f"Error while Updating Task. Error : {str(e)}"}), 500


    finally:
        cur.close()



@app.route("/taskallocation/getTaskAllocationHistoryDetails")
@token_required
def get_TaskAllocationHistory_HistoryDetails():


    TaskId = request.args.get("TaskId")
    # try:
    cur = mysql.connection.cursor()


    print('calling history sp')
   
    cur.callproc("Ts_Sp_GetTaskHistoryDetails", [TaskId])


    print('fetching history data')
    history_details = cur.fetchall()


    print('history fetched')
    print(history_details)


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]


    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    print(data)


    return to_json, 200

# Get Filtered Time Sheet Entry
@app.route("/leaveentry/getFilteredLeaveEntries", methods = ["POST"])
def get_FilteredLeaveEntry():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]
    LeaveCode = data["LeaveCode"]
    

    cur = mysql.connection.cursor()

    cur.callproc("SP_getFilterLeaveEntry", (CompanyId, EmployeeId, Month, Year, LeaveCode))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200


# Inserting LeaveEntry
@app.route("/leaveentry/insertLeaveEntry", methods = ["POST"])
def insert_LeaveEntry():
    try:
        # Retrieving Data Posted to API
        data = request.get_json()

        CompanyId = data["CompanyId"]
        EmployeeId = data["EmployeeId"]
        Year = data["Year"]
        LeaveCode = data["LeaveCode"]
        NoOfDays = data["NoOfDays"]
        DebitCredit = data["DebitCredit"]
        Remarks = data["Remarks"]
        UserId = data["UserId"]

        # print(CompanyId)
        # print(EmployeeId)
        # print(LeaveCode)
        # print(DebitCredit)

        cur = mysql.connection.cursor()

        print('calling SP_InsertLeaveEntry')

        cur.callproc("SP_InsertLeaveEntry", (CompanyId, EmployeeId, Year, LeaveCode, NoOfDays, DebitCredit, Remarks, UserId))
        # result = cur.stored_results().fetchone()[2]

        print('getting result')

        result = cur.fetchall()

        rtnFlag = result[0][0]
        LeaveEntryId = result[0][2]

        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving LeaveEntry", "RtnRefId" : 0}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag" : True, "RtnMsg": "LeaveEntry saved successfully", "RtnRefId" : LeaveEntryId}), 201
       
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")


        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Saving LeaveEntry. Error : " + str(e)}), 500
   
    finally:
        cur.close()

# Get LeaveDetails balance
@app.route("/leaveentry/getLeaveDetails", methods = ["POST"])
def get_LeaveDetails():

    data = request.get_json()

    EmployeeId = data["EmployeeId"]
    LeaveCode = data["LeaveCodeId"]
    Year = data["Year"]

    # print("EmployeeId", EmployeeId)
    # print("Leave Code",LeaveCode)
    # print("Year",Year)

    cur = mysql.connection.cursor()

    cur.callproc("SP_getLeaveDetails", (EmployeeId, LeaveCode, Year))

    result = cur.fetchall()
    # Check if result is empty
    if len(result) == 0:
        balance = 0  # If no data found, set balance to 0
    else:
        balance = result[0][4]  # Assuming balance is in the 5th column (index 4)

    return jsonify({"balance": balance}), 201
 
# History Leave Entry API
@app.route("/leaveentry/getLeaveEntryHistoryDetails")
def get_LeaveEntry_HistoryDetails():
    LeaveEntryId = request.args.get("LeaveEntryId")
    
    # try:
    cur = mysql.connection.cursor()

    cur.callproc("SP_getLeaveEntry_HistoryDetails", [LeaveEntryId])

    history_details = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Cancel Modal For LeaveEntry Cancel API
@app.route("/leaveentry/cancelLeaveEntry", methods=["POST"])
def cancel_LeaveEntry():
    try:
        data = request.get_json()

        LeaveEntryId = data["LeaveEntryId"]
        UserId = data["UserId"]
        status = data["status"]
        statusUpdatedRemarks = data["statusUpdatedRemarks"]

        cur = mysql.connection.cursor()

        cur.callproc("SP_CancelLeaveEntry", (LeaveEntryId, UserId, status, statusUpdatedRemarks))
        result = cur.fetchall()

        rtnFlag = result[0][0]

        if rtnFlag == 1:
            return jsonify({"success": True, "message": "Leave Entry Cancel successfully"}), 200
        else:
            return jsonify({"success": False, "message": "Error Leave Entry Cancel"}), 500

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": "Error Leave Entry Cancel. Error: " + str(e)}), 500

    finally:
        if 'cur' in locals():
            cur.close()

# APi FOr My Task Status Update
@app.route("/mytask/updateMyTaskStatus", methods=["POST"])
@token_required
def update_mytask_status():
    try:
        data = request.get_json()


        TaskId = data["TaskId"]
        Status = data["Status"]
        StatusUpdatedBy = data["StatusUpdatedBy"]
        StartEndRemarks = data["StartEndRemarks"]
        CarryForwardDate = data["CarryForwardDate"]
        StartEndDate = data["StartEndDate"]
        StartEndTime = data["StartEndTime"]


        if Status == 'C':
            CarryForwardDate = None

        if Status == 'IP':
            CarryForwardDate = None

        if Status == 'CF':
            StartEndDate = None    
            StartEndTime = None

        cur = mysql.connection.cursor()

        cur.callproc("Ts_Sp_TaskStatusByEmployee", (TaskId, Status,  StatusUpdatedBy, StartEndRemarks , CarryForwardDate,StartEndDate, StartEndTime, ))
        result = cur.fetchall()

        rtnFlag = result[0][0]
        rtnMsg = result[0][1]
        print(rtnFlag)

        if rtnFlag == 1:
            return jsonify({"success": True, "message": "Task updated successfully"}), 200
        elif rtnFlag == 2:
            return jsonify({"success": False, "message": rtnMsg}), 500
        else:
            return jsonify({"success": False, "message": "Error updating Task status"}), 500

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": "Error While updating MyTask status. Error: " + str(e)}), 500

    finally:
        if 'cur' in locals():
            cur.close()


@app.route("/task/UpdateTaskSTatusByQA", methods=["POST"])
@token_required
def insert_TaskIssueQA():
    # Retrieving Data Posted to API
    data = request.get_json()
     
    CompanyId = data["CompanyId"] 
    TaskId = data["TaskId"]
    Issue = data["Issue"]
    Description = data["Description"]
    Severity = data["Severity"]
    Status = data["Status"]
    StatusUpdatedBy = data["StatusUpdatedBy"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_UpdateTaskStatusByQA", (CompanyId, TaskId, Issue, Description, Severity, Status, StatusUpdatedBy ,StatusUpdatedRemarks))

    # result = cur.stored_results().fetchone()[2]

    result = cur.fetchall()

    rtnFlag = result[0][0]
    IssueId = result[0][2]

    if rtnFlag==0:
        print("rtnFlag = 0")
        return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Updating the Task","RtnRefId" : 0}), 500
    else:
        print("rtnFlag = 1")
        return jsonify({"RtnFlag" : True, "RtnMsg": "Task Status Updated Successfully.","RtnRefId" : IssueId}), 201

# Menu DropDown

@app.route("/menu/getMenuForDropDown")

def get_MenuDropDown():

    cur = mysql.connection.cursor()

    cur.execute('SELECT MenuCode, MenuName FROM gl_menu_m WHERE MainMenuCode IS NULL')

    Menu_data = cur.fetchall()

    # print(projects_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    Menu_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(Menu_json)[0]["MenuCode"])
   
    Menu_json = json.loads(Menu_json)

    menu = [
        {"value": menus["MenuCode"], "label": menus["MenuName"]}
        for menus in Menu_json
    ]
    return menu, 200


# Sub Menu DropDown

@app.route("/submenu/getSubMenuForDropDown")

def get_SubMenuDropDown():

    cur = mysql.connection.cursor()

    cur.execute('SELECT MenuCode, MenuName FROM gl_menu_m WHERE MainMenuCode IS NOT NULL')

    Menu_data = cur.fetchall()

    # print(projects_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    SubMenu_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(SubMenu_json)[0]["MenuCode"])
   
    SubMenu_json = json.loads(SubMenu_json)

    menu = [
        {"value": menus["MenuCode"], "label": menus["MenuName"]}
        for menus in SubMenu_json
    ]
    return menu, 200    


# My Task FIlter
            
@app.route("/mytask/getFilteredMyTask")

def get_FilteredMyTask():

    CompanyId = request.args.get("CompanyId")
    ProjectName = request.args.get("ProjectName")
    MenuName = request.args.get("MenuName")
    SubMenuName = request.args.get("SubMenuName")
    TaskTypeName = request.args.get("TaskTypeName")
    TaskStatus = request.args.get("TaskStatus")
    FromDate = request.args.get("FromDate")
    ToDate = request.args.get("ToDate")
    EmployeeId = request.args.get("EmployeeId")
    # Status = request.args.get("Status")

    cur = mysql.connection.cursor()

    to_json = []
   
    sCond ='1=1'
   
    sQry = 'select TaskId, TaskName, ProjectId, ProjectName, MenuName, MenuCode, SubMenuCode, SubMenuName, TaskTypeName, TotalIssue, fn_getFormattedDate(TargetDate) as TargetDateFormated, TaskStatus, TaskStatusName, StatusUpdatedByFullName, fn_getFormattedDateTime(StatusUpdatedOn, 0) as StatusUpdatedOnFormated, StatusUpdatedRemarks, fn_getFormattedDateTime(TaskEndDate, 0) as TaskEndDateFormated , fn_getFormattedDateTime(TaskAllocatedOn, 0) as TaskAllocatedOnFormated, AllocatedToFullName from ts_vw_gettaskdetails'

    sCond = " CompanyId = " + CompanyId

    if ProjectName != "" and ProjectName !=0 and ProjectName is not None:
        sCond = sCond + ' and ProjectId = "' + ProjectName + '"'

    if MenuName != "" and MenuName is not None:
        sCond = sCond + ' and MenuCode = "' + MenuName + '"'

    if SubMenuName != "" and SubMenuName is not None:
        sCond = sCond + ' and SubMenuCode = "' + SubMenuName + '"'

    if TaskTypeName != "" and TaskTypeName is not None:
        sCond = sCond + ' and TaskTypeId = "' + TaskTypeName + '"'      

    if TaskStatus != "" and TaskStatus is not None:
        sCond = sCond + ' and TaskStatus = "' + TaskStatus + '"'

    if FromDate != "" and FromDate is not None:
        sCond = sCond + ' and TargetDate >= "' + FromDate + '"'

    if ToDate != "" and ToDate is not None:
        sCond = sCond + ' and TargetDate <= "' + ToDate + '"'

    sCond = sCond + ' and TaskAllocatedTo = "' + EmployeeId + '"'

    sQry = sQry + ' where ' + sCond + ' ORDER BY StatusUpdatedOnFormated DESC'

    print(sQry)

    mytasks = cur.execute(sQry)

    if mytasks > 0:
        mytasks_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200



@app.route("/mytask/updateIssueStatus", methods=["POST"])
@token_required
def update_Issue_status():
    try:
        data = request.get_json()

        IssueId = data["IssueId"]
        Status = data["Status"]
        StatusUpdatedBy = data["StatusUpdatedBy"]
        StartEndRemarks = data["StartEndRemarks"]
        CarryForwardDate = data["CarryForwardDate"]
        StartEndDate = data["StartEndDate"]
        StartEndTime = data["StartEndTime"]


        if Status == 'C':
            CarryForwardDate = None

        if Status == 'IP':
            CarryForwardDate = None

        if Status == 'CF':
            StartEndDate = None    
            StartEndTime = None

        cur = mysql.connection.cursor()

        cur.callproc("Ts_Sp_UpdateIssueStatus", (IssueId, Status,  StatusUpdatedBy,  StartEndRemarks ,CarryForwardDate ,StartEndDate, StartEndTime, ))
        result = cur.fetchall()

        rtnFlag = result[0][0]
        rtnMsg = result[0][1]
        print(rtnFlag)

        if rtnFlag == 1:
            return jsonify({"success": True, "message": "Issue updated successfully"}), 200
        elif rtnFlag == 2:
            return jsonify({"success": False, "message": rtnMsg}), 500
        else:
            return jsonify({"success": False, "message": "Error updating Issue status"}), 500


    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": "Error While updating Issue status. Error: " + str(e)}), 500

    finally:
        if 'cur' in locals():
            cur.close()

# get Issue List in Column

@app.route("/issue/getIssueListInColumn", methods=['GET'])
@token_required
def get_IssueListInColumn():

    TaskId = request.args.get("TaskId")
   
    if not TaskId:
        return jsonify({"error": "TaskId parameter is required"}), 400

    try:
        with mysql.connection.cursor() as cur:
            cur.callproc("SP_getIssueListInColumn", [TaskId])
            columns = [col[0] for col in cur.description]
            rows = cur.fetchall()
            data = [dict(zip(columns, row)) for row in rows]
           
            # Optionally print the data to console (remove in production)
            print(data)

            return jsonify(data), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

# View Issue List

@app.route("/view/getViewIssueList", methods=['GET'])
@token_required
def get_viewTaskDetails():


    TaskId = request.args.get("TaskId")
   
    if not TaskId:
        return jsonify({"error": "TaskId parameter is required"}), 400

    try:
        with mysql.connection.cursor() as cur:
            cur.callproc("SP_getViewIssueDetails", [TaskId])
            columns = [col[0] for col in cur.description]
            rows = cur.fetchall()
            data = [dict(zip(columns, row)) for row in rows]
           
            # Optionally print the data to console (remove in production)
            print(data)


            return jsonify(data), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/Issue/getIssueDetailForPrint", methods=['GET'])
# @token_required
def get_viewIssueDetails():
    print('Issue/getIssueDetailForPrint called')


    IssueId = request.args.get("IssueId")
   
    print("Issue Id :", IssueId)
    if not IssueId:
        return jsonify({"error": "IssueId parameter is required"}), 400
    try:
        with mysql.connection.cursor() as cur:
            cur.callproc("SP_getIssueDetailsForPrint", [IssueId])
            columns = [col[0] for col in cur.description]
            rows = cur.fetchall()
            data = [dict(zip(columns, row)) for row in rows]
           
            print("getting Issue Details For Print")
            # Optionally print the data to console (remove in production)
            print(data)


            return data, 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/task/getMyTask", methods=["GET"])
@token_required
def get_MyTaskLiskForEmployee():
    
    cur = mysql.connection.cursor()
   
    TaskAllocatedTo = request.args.get("TaskAllocatedTo")
    ProjectId = request.args.get("ProjectId")
    MenuCode = request.args.get("MenuCode")
    SubMenuCode = request.args.get("SubMenuCode")
    TaskTypeId = request.args.get("TaskTypeId")
    TaskStatus = request.args.get("TaskStatus")
    FromDate = request.args.get("FromDate")
    ToDate = request.args.get("ToDate")

    if FromDate == '':
        FromDate = '1990-01-01'

    if ToDate == '':
        ToDate = '1990-01-01'

    # print('TaskAllocatedTo : ' + str(TaskAllocatedTo))
    # print('ProjectName : ' + ProjectName)
    # print('MenuName : ' + MenuName)
    # print('SubMenuName : ' + SubMenuName)
    # print('TaskTypeName : ' + TaskTypeName)
    # print('TaskStatus : ' + TaskStatus)
    # print('FromDate : ' + FromDate)
    # print('ToDate : ' + ToDate)

    cur.callproc("Ts_Sp_GetMyTaskList", [TaskAllocatedTo,ProjectId,MenuCode,SubMenuCode,TaskTypeId,TaskStatus,FromDate,ToDate])

    data = cur.fetchall()

    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in data]

    result = json.dumps(data)

    print (result)
    # print(jsonify(result))

    cur.close()

    return result, 200


# InsertIssue For Task

@app.route("/task/insertIssue", methods=["POST"])
@token_required
def insert_TaskIssue():
    # Retrieving Data Posted to API
    data = request.get_json()

    TaskId = data["TaskId"]
    Issue = data["Issue"]
    Description = data["Description"]
    Severity = data["Severity"]
    CreatedBy = data["UserId"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_InsertIssue", (TaskId, Issue, Description, Severity, CreatedBy))

    # result = cur.stored_results().fetchone()[2]

    result = cur.fetchall()

    rtnFlag = result[0][0]

    if rtnFlag==0:
        print("rtnFlag = 0")
        return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Creating the issue"}), 500
    else:
        print("rtnFlag = 1")
        return jsonify({"RtnFlag" : True, "RtnMsg": "Congratulation!!! issue has been created."}), 201


# Issue List For QA

@app.route("/task/getTaskIssueListForQA", methods=["GET"])
@token_required
def get_IssueListForQA():
    cur = mysql.connection.cursor()

    UserId = request.args.get("UserId")
    ProjectId = request.args.get("ProjectId")
    Status = request.args.get("Status")
    FromDate = request.args.get("FromDate")
    ToDate = request.args.get("ToDate")


    if FromDate == '':
        FromDate = '1990-01-01'

    if ToDate == '':
        ToDate = '1990-01-01'

    cur.callproc("SP_getIssueListForQA", [UserId, ProjectId, Status, FromDate, ToDate])

    data = cur.fetchall()

    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in data]

    result = json.dumps(data)

    print (result)
    # print(jsonify(result))

    cur.close()

    return result, 200


#IssueList API 

@app.route("/mytask/getMyTaskIssueList")
@token_required
def get_IssueList():

    TaskId = request.args.get("TaskId")
    # try:
    cur = mysql.connection.cursor()

    print('calling history sp')
    # cur.callproc("SP_getMyTaskIssueList", (TaskId,))
    cur.callproc("SP_getMyTaskIssueList", [TaskId])

    print('fetching history data')
    history_details = cur.fetchall()

    print('history fetched')
    print(history_details)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)
    print(data)

    return to_json, 200

# Issue LIst For Manager

@app.route("/issue/getIssueListForManager", methods=["GET"])
@token_required
def get_IssueListForManager():
    print('getIssueListForManager API Called') 
    cur = mysql.connection.cursor()


    CompanyId = request.args.get("CompanyId")
    UserId = request.args.get("UserId")
    ProjectId = request.args.get("ProjectId")
    Status = request.args.get("Status")
    FromDate = request.args.get("FromDate")
    ToDate = request.args.get("ToDate")

    if FromDate == '':
        FromDate = '1900-01-01'

    if ToDate == '':
        ToDate = '1900-01-01'

    print('Calling Stored procedure SP_getIssueListForManager')
    cur.callproc("SP_getIssueListForManager", [CompanyId, UserId, ProjectId, Status, FromDate, ToDate])
    print('End Calling Stored procedure SP_getIssueListForManager')

    print('Fetching Data')
    data = cur.fetchall()
    print('End Fetching Data')

    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in data]

    result = json.dumps(data)

    print (result)
    # print(jsonify(result))

    cur.close()

    return result, 200

# Allocate Issue To Employee

@app.route("/issue/AllocateIssueToEmployee", methods=["POST"])
def AllocateIssueToEmployee():

    data = request.get_json()

    IssueId = data["IssueId"]
    EmployeeId = data["EmployeeId"]
    Status = data["Status"]
    StatusUpdatedBy = data["StatusUpdatedBy"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]

    cur = mysql.connection.cursor()

    cur.callproc("TS_SP_AllocateIssueToEmployee", (IssueId, EmployeeId, Status, StatusUpdatedBy, StatusUpdatedRemarks))
    result = cur.fetchall()
    print(IssueId,EmployeeId,Status,StatusUpdatedBy,StatusUpdatedRemarks)
    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)
    
    print("TS_SP_AllocateIssueToEmployee",result)

    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Issue Allocation Task"}), 500
    else:
        return jsonify({"RtnFlag": True, "RtnMsg": "Issue Allocation Task Successfully"}), 200

# Allocate Issue For Testing

@app.route("/Issue/AllocatedIssueForTesting", methods=["POST"])
def AllocateIssueForTesting():
    # Retrieve data posted to the API
    print("Allocate Issue For Testing API")
    
    data = request.get_json()
 
    IssueId = data["IssueId"]
    QcEmpId = data["QcEmpId"]
    AllocatedToQcEmp = data["AllocatedToQcEmp"]
    Status = data["Status"]
    StatusUpdatedBy = data["StatusUpdatedBy"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]

    print('issue Id = ' + str(IssueId))
    print('QC Emp Id = ' + str(QcEmpId))
    print('Allocated To QC EMP = ' + AllocatedToQcEmp)
    print('Status = ' + Status)
    print('Status updated by = ' + str(StatusUpdatedBy))
    print('Status updated remarks = ' + StatusUpdatedRemarks)

    cur = mysql.connection.cursor()

    cur.callproc("TS_SP_AllocateIssueForTesting", (IssueId, QcEmpId, AllocatedToQcEmp, Status, StatusUpdatedBy, StatusUpdatedRemarks))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Allocating the Issue Task for testing Task"}), 500
    else:
        return jsonify({"RtnFlag": True, "RtnMsg": "Allocated Issue Task For tesing  Successfully"}), 200


@app.route("/issue/UpdateIssueAfterAllocating", methods=["POST"])
@token_required
def IssueUpdate_Status():
    # Retrieve data posted to the API
    data = request.get_json()

    IssueId = data["IssueId"]
    Status = data["Status"]
    StatusUpdatedBy = data["StatusUpdatedBy"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]

    cur = mysql.connection.cursor()

    cur.callproc("TS_SP_UpdateIssueStatusByQA", (IssueId, Status, StatusUpdatedBy, StatusUpdatedRemarks))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Updating Task issue status"}), 500
    else:
        return jsonify({"RtnFlag": True, "RtnMsg": "updating Issue Status Successfully"}), 200


@app.route("/task/ReleaseTask", methods=["POST"])
@token_required
def Release_Task():
    # Retrieve data posted to the API
    data = request.get_json()

    TaskId = data["TaskId"]
    Status = data["Status"]
    StatusUpdatedBy = data["StatusUpdatedBy"]
    ReleasedRemarks = data["ReleasedRemarks"]

    cur = mysql.connection.cursor()

    cur.callproc("TS_SP_ReleseIndevServerorLiveserverTask", (TaskId, Status, StatusUpdatedBy, ReleasedRemarks))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Releasing Task"}), 500
    else:
        return jsonify({"RtnFlag": True, "RtnMsg": "Released Task Successfully"}), 200


#Allocate Issue For Testing 

@app.route("/task/ReleaseIssue", methods=["POST"])
def ReleaseIssue_Task():
    # Retrieve data posted to the API
    data = request.get_json()


    IssueId = data["IssueId"]
    Status = data["Status"]
    StatusUpdatedBy = data["StatusUpdatedBy"]
    ReleasedRemarks = data["ReleasedRemarks"]

    cur = mysql.connection.cursor()

    cur.callproc("TS_SP_ReleaseIssue", (IssueId, Status, StatusUpdatedBy, ReleasedRemarks))
    result = cur.fetchall()


    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)


    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Releasing Task Issue"}), 500
    else:
        return jsonify({"RtnFlag": True, "RtnMsg": "Released Task Issue Successfully"}), 200



# allocated Task For Testing

@app.route("/task/AllocatedTaskForTesting", methods=["POST"])
@token_required
def AllocateTaskForTesting_Task():
    # Retrieve data posted to the API
    data = request.get_json()


    CompanyId = data["CompanyId"]
    TaskId = data["TaskId"]
    QcEmpId = data["QcEmpId"]
    AllocatedToQcEmp = data["AllocatedToQcEmp"]
    TaskForTestingRemarks = data["TaskForTestingRemarks"]
    Status = data["Status"]
    StatusUpdatedBy = data["StatusUpdatedBy"]


    cur = mysql.connection.cursor()


    cur.callproc("TS_SP_AllocatedTaskForTesing", (CompanyId, TaskId, QcEmpId, AllocatedToQcEmp,  TaskForTestingRemarks, Status, StatusUpdatedBy))
    result = cur.fetchall()


    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)


    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Allocating the task for testing Task"}), 500
    else:
        return jsonify({"RtnFlag": True, "RtnMsg": "Allocated Task For tesing  Successfully"}), 200

# Get My Leave Summary Report List
@app.route("/MyLeaveSummaryReport/getMyLeaveSummaryReport/<EmployeeId>")
def get_MyLeaveSummaryReport(EmployeeId):
    cur = mysql.connection.cursor()

    to_json = []
    
    if int(EmployeeId) > 0:
        myleavesummary = cur.execute('select LeaveSummaryId, EmployeeId, EmployeeName, MonthYear, CL, PL, SL, CO, ML, TOTAL from rpt_leavesummaryreport_d where EmployeeId = ' + EmployeeId)
    else:
        myleavesummary = cur.execute('select LeaveSummaryId, EmployeeId, EmployeeName, MonthYear, CL, PL, SL, CO, ML, TOTAL from rpt_leavesummaryreport_d')

    if myleavesummary > 0:
        myleavesummary_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
        
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200

# Filtering For LeaveSummaryReport API
@app.route("/LeaveSummaryReport/getLeaveSummaryReport", methods=["POST"])
def Filter_LeaveSummaryReport():


    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]
   


    print(EmployeeId)
    print(Month)
    print(Year)
    cur = mysql.connection.cursor()


    cur.callproc("SP_RPT_getLeaveSummaryReport", (CompanyId, SessionId, EmployeeId, Month, Year))
    data = cur.fetchall()


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)
   


    return to_json, 200

# Filtering For LeaveSummaryReport API for EmployeeDashboard
@app.route("/EmployeeDashboard/getLeaveSummaryReport", methods=["POST"])
def Filter_LeaveSummaryReport_EmpDashboard():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getLeaveSummaryReport_EmpDashboard", (CompanyId, SessionId, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Filtering For MyLeaveSummaryReport API
@app.route("/MyLeaveSummaryReport/getMyLeaveSummaryReport", methods=["POST"])
def Filter_MyLeaveSummaryReport():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    # print(EmployeeId)
    # print(Month)
    # print(Year)
    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getMyLeaveSummaryReport", (CompanyId, SessionId, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Filtering For LeaveRegister API
@app.route("/LeaveRegister/getLeaveRegister", methods=["POST"])
def Filter_LeaveRegister():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getLeaveRegister", (CompanyId, SessionId, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Filtering For LeaveRegister API for EmployeeDashboard
@app.route("/EmployeeDashboard/getLeaveRegister", methods=["POST"])
def Filter_LeaveRegister_EmpDashboard():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getLeaveRegister_EmpDashboard", (CompanyId, SessionId, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Filtering For MyLeaveRegister API
@app.route("/MyLeaveRegister/getMyLeaveRegister", methods=["POST"])
def Filter_MyLeaveRegister():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    # print(EmployeeId)
    # print(Month)
    # print(Year)

    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getMyLeaveRegister", (CompanyId, SessionId, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Filtering For AttendanceSummaryReport API
@app.route("/AttendanceSummaryReport/getAttendanceSummaryReport", methods=["POST"])
def Filter_AttendanceSummary():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    print(EmployeeId)
    print(Month)
    print(Year)
    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getAttendanceSummaryReport", (CompanyId, SessionId, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)
    

    return to_json, 200

# Filtering For AttendanceSummaryReport API
@app.route("/EmployeeDashboard/getAttendanceSummaryReport", methods=["POST"])
def Filter_AttendanceSummary_EmployeeDashboard():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    print(EmployeeId)
    print(Month)
    print(Year)
    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getAttendanceSummaryReport_EmpDashboard", (CompanyId, SessionId, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)
    

    return to_json, 200

# Filtering For Attendance Details API
@app.route("/AttendanceDetails/getAttendanceDetails", methods=["POST"])
@token_required
def Filter_AttendanceDetails():


    data = request.get_json()


    CompanyId = data["CompanyId"]
    CategoryId = data["CategoryId"]
    DepartmentId = data["DepartmentId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]


    # print(EmployeeId)
    # print(Month)
    # print(Year)
    cur = mysql.connection.cursor()


    cur.callproc("SP_getAttendanceDetails", (CompanyId, CategoryId, DepartmentId, EmployeeId, Month, Year))
    data = cur.fetchall()


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    return to_json, 200




# Filtering For EmpAttendance Details API
@app.route("/EmpAttendanceDetails/getEmpAttendanceDetails", methods=["POST"])
def Filter_EmpAttendanceDetails():


    data = request.get_json()


    CompanyId = data["CompanyId"]
    CategoryId = data["CategoryId"]
    DepartmentId = data["DepartmentId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]


    print(EmployeeId)
    print(Month)
    print(Year)
    cur = mysql.connection.cursor()


    cur.callproc("SP_getAttendanceDetails", (CompanyId, CategoryId, DepartmentId, EmployeeId, Month, Year))
    data = cur.fetchall()


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)
   


    return to_json, 200





# Filtering For MyAttendanceSummaryReport API
@app.route("/MyAttendanceSummaryReport/getMyAttendanceSummaryReport", methods=["POST"])
def Filter_MyAttendanceSummaryReport():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    # print(EmployeeId)
    # print(Month)
    # print(Year)
    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getMyAttendanceSummaryReport", (CompanyId, SessionId, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200


# Filtering For AttendanceRegister API
@app.route("/AttendanceRegister/getAttendanceRegister", methods=["POST"])
def Filter_AttendanceRegister():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    Sessionid = data["Sessionid"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]
    
    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getAttendanceRegister", (CompanyId, Sessionid, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Filtering For AttendanceRegister API for EmployeeDashboard
@app.route("/EmployeeDashboard/getAttendanceRegister", methods=["POST"])
def Filter_AttendanceRegister_EmpDashbaord():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    Sessionid = data["Sessionid"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]
    
    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getAttendanceRegister_EmpDashboard", (CompanyId, Sessionid, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Filtering For MyAttendanceRegister API
@app.route("/MyAttendanceRegister/getMyAttendanceRegister", methods=["POST"])
def Filter_MyAttendanceRegister():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]


    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getMyAttendanceRegister", (CompanyId, SessionId, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200


# Filtering For Todays Attendance API
@app.route("/TodaysAttendance/getTodaysAttendance", methods=["POST"])
def Filter_TodayAttendance():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["Sessionid"]
    EmployeeId = data["EmployeeId"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getTodaysAttendance", (CompanyId, SessionId, EmployeeId))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Filtering For Task Summary API
@app.route("/TaskSummary/getTaskSummary", methods=["POST"])
def Filter_TaskSummary():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    ToDays = data["ToDays"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getTaskSummary", (CompanyId, SessionId, ToDays, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Filtering For Task Summary API for Employee
@app.route("/EmployeeDashboard/getEmployeeTaskSummary", methods=["POST"])
def Filter_EmployeeTaskSummary():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    ToDays = data["ToDays"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getTaskSummary_EmpDashboard", (CompanyId, SessionId, ToDays, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200


# Filtering For Employee wise task Summary API
@app.route("/EmployeeWiseTaskSummary/getEmployeeWiseTaskSummary", methods=["POST"])
def EmployeeWiseTaskSummary():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    ToDays = data["ToDays"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getEmployeeWiseTaskSummary", (CompanyId, SessionId, ToDays, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Filtering For Employee wise task Summary API for Employee Dashboard
@app.route("/EmployeeDashboard/getUpcommingTask", methods=["POST"])
def EmployeeDashboard_UpcommingTask():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    EmployeeId = data["EmployeeId"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_UpcommingTask_EmpDashboard", (CompanyId,EmployeeId))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Get Leave Balance API for Employee Dashboard
@app.route("/EmployeeDashboard/getLeaveBalance", methods=["POST"])
def EmployeeDashboard_LeaveBalance():

    data = request.get_json()

    # CompanyId = data["CompanyId"]
    EmployeeId = data["EmployeeId"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_LeaveBalance_EmpDashboard", [EmployeeId])
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Filtering For Upcomming leaves API
@app.route("/UpcomingLeave/getUpcomingLeave", methods=["POST"])
def UpcommingLeave():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getUpcommingLeave", (CompanyId, SessionId, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Upcomming meeting
@app.route("/Dashboard/getUpcommingMeeting", methods=["POST"])
def Dashboard_UpcommingMeeting():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    UserId = data["UserId"]
    Status = data["Status"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_UpcommingMeeting_Dashboard", (CompanyId, UserId, Status))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200


# get Attendance data
@app.route("/Attendance/getAttendanceDataForCalendar", methods=["POST"])
def AttendDateForCalendar():
    data = request.get_json()

    CompanyId = data["CompanyId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_EmployeeAttendDailyCalendar", (CompanyId, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# get Attendance data for employee Dashboard
@app.route("/EmployeeDashboard/getAttendanceDataForCalendar", methods=["POST"])
def EmpDashboard_AttendDateForCalendar():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_EmployeeAttendDailyCalendar_EmpDashboard", (CompanyId, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# @app.route("/ManagerDashboard/getSelectionEmployeeNameDropDown")
# def get_SelectionEmployeeDropDown(CompanyId):
#     cur = mysql.connection.cursor()
    
#     cur.execute('SELECT EmployeeId, EmployeeName FROM gl_employee_m')

#     projects_data = cur.fetchall()

#     # print(projects_data)

#     rows = [x for x in cur]
#     columns = [col[0] for col in cur.description]

#     data = [dict(zip(columns, row)) for row in rows]
       
#     # to_json = json.dumps(data, indent=2)
#     projects_json = json.dumps(data)

#     # print(projects_json)
#     print(json.loads(projects_json)[0]["EmployeeId"])
    
#     projects_json = json.loads(projects_json);

#     projects = [
#         {"value": project["EmployeeId"], "label": project["EmployeeName"]}
#         for project in projects_json
#     ]

#     return projects, 200


@app.route("/employee/getEmployeeNameDropDown")
def get_EmpDropDown():
    TaskAllocatedTo = request.args.get("TaskAllocatedTo")
    
    print(TaskAllocatedTo)

    cur = mysql.connection.cursor()

    if TaskAllocatedTo == 'QC':
        query = 'SELECT EmployeeId, EmployeeName FROM vw_getemployeedetails WHERE RoleId=8'
    else:
        query = 'SELECT EmployeeId, EmployeeName FROM vw_getemployeedetails WHERE RoleId!=8'

    cur.execute(query)

    projects_data = cur.fetchall()

    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in projects_data]

    employees = [
        {"value": employee["EmployeeId"], "label": employee["EmployeeName"]}
        for employee in data
    ]

    return jsonify(employees), 200


#Allocated To  

@app.route("/ManagerDashboard/getSelectionEmployeeNameDropDown/<CompanyId>")
def get_EmployeeDropDown(CompanyId):
    cur = mysql.connection.cursor()
    
    if CompanyId=="Undefined":
        CompanyId=1

    cur.execute("SELECT EmployeeId, EmployeeName FROM gl_employee_m where CompanyId="+str(CompanyId))

    projects_data = cur.fetchall()

    # print(projects_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    projects_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(projects_json)[0]["EmployeeId"])
    
    projects_json = json.loads(projects_json)

    projects = [
        {"value": project["EmployeeId"], "label": project["EmployeeName"]}
        for project in projects_json
    ]

    return projects, 200


# get WeekOff data
@app.route("/Attendance/getWeekOffDateForCalendar", methods=["POST"])
def WeekOffDateForCalendar():

    data = request.get_json()

    Month = data["Month"]
    Year = data["Year"]

    cur = mysql.connection.cursor()
    
    cur.callproc("SP_getWeekOffDateForCalendar", (Month, Year))

    data = cur.fetchall()

    # print("After fetch data")

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# get Holiday data
@app.route("/Calendar/getHolidayDateForCalendar", methods=["POST"])
def HolidayDateForCalendar():

    data = request.get_json()

    Month = data["Month"]
    Year = data["Year"]

    cur = mysql.connection.cursor()
    
    cur.callproc("SP_getHolidayDateForCalendar", (Month, Year))

    data = cur.fetchall()

    # print("After fetch data")

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Birthdays API

@app.route("/birthdays/getBirthdays", methods=["GET"])
def get_Birthdays():
    cur = mysql.connection.cursor()

    CompanyId = request.args.get("CompanyId")

    cur.callproc("SP_GetBirthdays", [CompanyId])

    data = cur.fetchall()

    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in data]

    result = json.dumps(data)

    print (result)
    # print(jsonify(result))

    cur.close()

    return result, 200

@app.route("/anniversaries/getAnniversaries", methods=["GET"])
def get_Anniversaries():
    cur = mysql.connection.cursor()
    
    CompanyId = request.args.get("CompanyId")

    cur.callproc("SP_GetAnniversaries", [CompanyId])

    data = cur.fetchall()

    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in data]

    result = json.dumps(data)

    print (result)
    # print(jsonify(result))

    cur.close()

    return result, 200

# Get Notice
@app.route("/Notification/getNoticeList", methods=["POST"])
def getNoticeList():
    # By Sandhi Gurung - 07-Aug-2024 (For getting Notice List)
    
    print('getNoticeList Api Called')

    data = request.get_json()
    
    CompanyId = str(data["CompanyId"])
    UserRoleId = data["UserRoleId"]
    
    if CompanyId == 'null':
        CompanyId = 0

    print('companyid : ' + str(CompanyId))

    cur = mysql.connection.cursor()
    
    cur.callproc("sp_getEventReminderList", (CompanyId, UserRoleId))

    data = cur.fetchall()

    # print("After fetch data")

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    print(to_json)

    return to_json, 200
    
# get Notification for User
@app.route("/Notification/getNotification", methods=["POST"])
def getNotification():
    #By Sandhi Gurung - For getting Notification for User
    print('getNotification Api Called')
   
    data = request.get_json()

    UserId = data["UserId"]
    LastNotificationId = data["LastNotificationId"]

    print('LastNotificationId = ' + str(LastNotificationId))

    cur = mysql.connection.cursor()
   
    cur.callproc("SP_getNotification", [UserId, LastNotificationId])


    data = cur.fetchall()


    print("After fetching notification data")


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    print ('to_json')
    print (to_json)
   
    return to_json, 200

    # NotificationSeenOneLine

@app.route("/notification/MarkNotificationSeenOnLine", methods=["POST"])
def MarkNotificationSeenOneLine():

    data = request.get_json()

    NotificationId = data["NotificationId"]
    NotificationSeen = data["NotificationSeen"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_MarkSeenNotificationOneLine", (NotificationId,NotificationSeen))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg}), 200
    else:

        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500

# getReminder

@app.route("/Reminder/getReminder", methods=["POST"])
def getReminder():
    #By Sandhi Gurung - For getting Notification for User
    print('getReminder Api Called')
   
    data = request.get_json()

    UserId = data["UserId"]
    LastReminderId = data["LastReminderId"]
    ReminderStatus = data["ReminderStatus"]
    ReminderCategory = data["ReminderCategory"]

    print('LastReminderId = ' + str(LastReminderId))

    cur = mysql.connection.cursor()
   
    cur.callproc("SP_getReminder", [UserId, LastReminderId, ReminderStatus, ReminderCategory])

    data = cur.fetchall()

    print("After fetching Reminder data")

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    print ('to_json')
    print (to_json)
   
    return to_json, 200

# SendReminder

@app.route("/sendReminder", methods=["POST"])
def sendReminder():
    print('sendReminder API Called')
    data = request.get_json()

    TemplateId = data.get("TemplateId")
    RefId = data.get("RefId")
    UserId = data.get("UserId")

    cur = mysql.connection.cursor()

    cur.callproc("SP_getReminderTemplateDetails", [TemplateId]) 
    returnResult = cur.fetchall()
    if len(returnResult) == 0:
        cur.close()  
        return jsonify({"RtnFlag": False, "RtnMsg": "No Reminder template found"}), 404

    ReminderSP = returnResult[0][0]

    cur.close()  # Close cursor after fetching results

    cur = mysql.connection.cursor()

    cur.callproc(ReminderSP, (TemplateId, RefId, UserId))

    result = cur.fetchall()
    cur.close()  # Close cursor after fetching results

    if len(result) == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while getting Notification"}), 500

    rtnFlag = result[0][0]

    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while getting Reminder"}), 500
    
    # Add a success response here
    return jsonify({"RtnFlag": True, "RtnMsg": "Reminder send successfully"}), 200

# MarkALlAsSeen

@app.route("/notification/MarkAllNotificationSeen", methods=["POST"])
def MarkAllNotificationSeen():

    data = request.get_json()

    UserId = data["UserId"]
    NotificationSeen = data["NotificationSeen"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_MarkAllSeenNotification", (UserId,NotificationSeen))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500

# get Filtered Notification 

@app.route("/Notification/getFilteredNotification", methods=["POST"])
def getFilteredNotification():
    #By Sandhi Gurung - For getting Notification for User 
    data = request.get_json()

    UserId = data["UserId"]
    LastNotificationId = data["LastNotificationId"]
    NotificationStatus = data["NotificationStatus"]

    print('LastNotificationId = ' + str(LastNotificationId))

    cur = mysql.connection.cursor()
   
    cur.callproc("SP_getAllNotifications", [UserId, LastNotificationId,NotificationStatus])

    data = cur.fetchall()

    print("After fetching notification data")

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    print ('to_json')
    print (to_json)
   
    return to_json, 200    


@app.route("/Notification/getNotificationDetails", methods=["POST"])
def getNotificationDetails():
   
    data = request.get_json()
  
    NotifictionId = data["NotificationId"]

    cur = mysql.connection.cursor()
   
    cur.callproc("SP_getNotificationDetails", [NotifictionId])

    data = cur.fetchall()

    print("After fetching notification data")

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    print ('to_json')
    print (to_json)
   
    return to_json, 200



# get profile details
@app.route("/profile/getProfileDetails/<EmployeeId>")
def get_ProfileDetails(EmployeeId):

    cur = mysql.connection.cursor()

    to_json = []
   
    if int(EmployeeId) > 0:

        cities = cur.execute('select EmployeeId, EmployeeName, EmployeeCode, Address1, Address2, CityId, CityName, StateId, StateName, PinCode, AdharNumber, PanNumber, PassportNumber,EmployeeEmailId, EmployeeMobileNo, EmployeeGender, fn_getFormattedDate(employeeDOB) as DateOfBirthFormated, DATE_FORMAT(employeeDOB, "%Y-%m-%d") as DateOfBirth, employeeMaritalStatus, EmployeeDepartmentId, EmployeeDepartmentName, CategoryId, CategoryName, EmployeeDesignationId, EmployeeDesignationName, EmployeeManagerId, EmployeeManagerName, EmployeeStatusCode, EmployeeStatus, ImageUrl from vw_getemployeedetails where employeeid = ' + EmployeeId)
    else:
        cities = cur.execute('select EmployeeId, EmployeeName, EmployeeCode, Address1, Address2, CityId, CityName, StateId, StateName, PinCode, AdharNumber, PanNumber, PassportNumber,EmployeeEmailId, EmployeeMobileNo, EmployeeGender, fn_getFormattedDate(employeeDOB) as DateOfBirthFormated, DATE_FORMAT(employeeDOB, "%Y-%m-%d") as DateOfBirth, employeeMaritalStatus, EmployeeDepartmentId, EmployeeDepartmentName, CategoryId, CategoryName, EmployeeDesignationId, EmployeeDesignationName, EmployeeManagerId, EmployeeManagerName, EmployeeStatusCode, EmployeeStatus, ImageUrl from vw_getemployeedetails')
       
    if cities > 0:

        city_data = cur.fetchall()

        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
       
        # to_json = json.dumps(data, indent=2)
        to_json = json.dumps(data)

    return to_json, 200


@app.route("/profile/UpdateProfileData", methods = ["POST"])
def UpdateProfiledata():

    # Retrieving Data Posted to API
    cur = mysql.connection.cursor()
    data = request.get_json()
    
    # print('UpdateEmployee API Called')
    

    EmployeeId = data["EmployeeId"]
    Address1 = data["Address1"]
    Address2 = data["Address2"]
    State = data["State"]
    CityId = data["CityId"]
    PinCode = data["PinCode"]
    AdharNumber = data["AdharNumber"]
    PanNumber = data["PanNumber"]
    PassportNumber = data["PassportNumber"]

    print("EmployeeId",EmployeeId)
    
    # print('calling SP_UpdateProfileData')

    cur.callproc("SP_UpdateProfileData",(EmployeeId, Address1, Address2, State, CityId, PinCode ,AdharNumber, PanNumber, PassportNumber))  

    print('getting result')

    result = cur.fetchall()

    rtnFlag = result[0][0]
    print("rtnFlag : " + str(rtnFlag))

    if rtnFlag==0:
        print("rtnFlag = 0")

        return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Updating Employee"}), 500
    else:
        print("rtnFlag = 1")

        return jsonify({"RtnFlag" : True, "RtnMsg": "Employee Updated successfully"}), 201

# Allocation Task API
@app.route("/task/AllocationTask", methods=["POST"])
@token_required
def Allocation_Task():
    # Retrieve data posted to the API
    data = request.get_json()

    TaskId = data["TaskId"]
    EmployeeId = data["EmployeeId"]
    Status = data["Status"]
    StatusUpdatedBy = data["StatusUpdatedBy"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]

    cur = mysql.connection.cursor()

    cur.callproc("TS_SP_TaskAllocation", (TaskId, EmployeeId, Status, StatusUpdatedBy, StatusUpdatedRemarks))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Allocation Task"}), 500
    else:
        return jsonify({"RtnFlag": True, "RtnMsg": "Allocation Task Successfully"}), 200

# ReAllocation Task API
@app.route("/task/ReallocationTask", methods=["POST"])
@token_required
def ReAllocation_Task():
    # Retrieve data posted to the API
    data = request.get_json()

    TaskId = data["TaskId"]
    EmployeeId = data["EmployeeId"]
    StatusUpdatedBy = data["StatusUpdatedBy"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]

    cur = mysql.connection.cursor()

    cur.callproc("TS_SP_TaskReAllocated", (TaskId, EmployeeId, StatusUpdatedBy, StatusUpdatedRemarks))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while ReAllocation Task"}), 500
    else:
        return jsonify({"RtnFlag": True, "RtnMsg": "ReAllocation Task Successfully"}), 200

# Cancel Task API
@app.route("/task/CancelTask", methods=["POST"])
@token_required
def Cancel_Task():
    # Retrieve data posted to the API
    data = request.get_json()

    TaskId = data["TaskId"]
    Status = data["Status"]
    StatusUpdatedBy = data["StatusUpdatedBy"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]

    cur = mysql.connection.cursor()

    cur.callproc("TS_SP_CancelTask", (TaskId, Status, StatusUpdatedBy, StatusUpdatedRemarks))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Allocation Task"}), 500
    else:
        return jsonify({"RtnFlag": True, "RtnMsg": "Allocation Task Successfully"}), 200

# Inserting Conpany Register Data
@app.route("/company/CompanyRegister", methods = ["POST"])
def insert_CompanyRegister():
    # Retrieving Data Posted to API
    data = request.get_json()

    CompanyName = data["CompanyName"]
    CompanyTypeId = data["CompanyTypeId"]
    NatureOfBussinessId = data["NatureOfBussinessId"]
    CompanySize = data["CompanySize"]
    Address1 = data["Address1"]
    Address2 = data["Address2"]
    CountryId = data["CountryId"]
    StateId = data["StateId"]
    CityId = data["CityId"]
    OtherCity = data["OtherCity"]
    PinCode = data["PinCode"]
    Landmark = data["Landmark"]
    ContactPersonTitle = data["ContactPersonTitle"]
    ContactPerson = data["ContactPerson"]
    MobileNo = data["MobileNo"]
    PhoneNo = data["PhoneNo"]
    EmailId = data["EmailId"]
    PANNo = data["PANNo"]
    TANNo = data["TANNo"]
    FaxNo = data["FaxNo"]
    TRNNo = data["TRNNo"]
    EINNo = data["EINNo"]
    GSTIN = data["GSTIN"]
    GSTPer = data["GSTPer"]
    GSTInclus = data["GSTInclus"]
    VATPer = data["VATPer"]
    VATIclus = data["VATIclus"]
    DefaultLanguage = data["DefaultLanguage"]
    UserId = data["UserId"]

    # print("CompanyName =", data["CompanyName"])
    # print("CompanyTypeId =", data["CompanyTypeId"])
    # print("NatureOfBussinessId =", data["NatureOfBussinessId"])
    # print("CompanySize =", data["CompanySize"])
    # print("Address1 =", data["Address1"])
    # print("Address2 =", data["Address2"])
    # print("CountryId =", data["CountryId"])
    # print("StateId =", data["StateId"])
    # print("CityId =", data["CityId"])
    # print("PinCode =", data["PinCode"])
    # print("Landmark =", data["Landmark"])
    # print("ContactPersonTitle =", data["ContactPersonTitle"])
    # print("ContactPerson =", data["ContactPerson"])
    # print("MobileNo =", data["MobileNo"])
    # print("PhoneNo =", data["PhoneNo"])
    # print("EmailId =", data["EmailId"])
    # print("PANNo =", data["PANNo"])
    # print("TANNo =", data["TANNo"])
    # print("FaxNo =", data["FaxNo"])
    # print("UserId =", data["UserId"])

    cur = mysql.connection.cursor()

    cur.callproc("SP_InsertCompany", (CompanyName, CompanyTypeId, NatureOfBussinessId, CompanySize, Address1, Address2, CountryId, StateId, CityId,OtherCity, PinCode, Landmark, ContactPersonTitle, ContactPerson, MobileNo, PhoneNo, EmailId, PANNo, TANNo, FaxNo, TRNNo, EINNo, GSTIN,GSTPer,GSTInclus,VATPer,VATIclus, DefaultLanguage, UserId))
    # result = cur.stored_results().fetchone()[2]

    result = cur.fetchall()

    CompanyId = None

    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    if rtnFlag == 1:
        CompanyId = result[0][2]


    if rtnFlag==0:
        print("rtnFlag = 0")
        return jsonify({"RtnFlag" : False, "RtnMsg": rtnMsg, "RtnRefId" : 0}), 500
    else:
        print("rtnFlag = 1")
        return jsonify({"RtnFlag" : True, "RtnMsg": rtnMsg, "RtnRefId" : CompanyId}), 201




# get dropdown for NatureOfBusiness    
@app.route("/company/getNatureOfBusinessDropDown")
def get_NatureOfBusinessDropDown():
    cur = mysql.connection.cursor()
    
    cur.execute('SELECT NatureId, NatureOfBussinessName FROM gl_natureofbussiness_d')

    projects_data = cur.fetchall()

    # print(projects_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    projects_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(projects_json)[0]["NatureId"])
    
    projects_json = json.loads(projects_json)

    projects = [
        {"value": project["NatureId"], "label": project["NatureOfBussinessName"]}
        for project in projects_json
    ]

    return projects, 200


# Get Company List
@app.route("/company/getCompanyList", methods=["POST"])
@token_required
def Get_CompanyList():
    data = request.get_json()
    
    CountryId = data["CountryId"]
    Status = data["Status"]
    ActiveDeactive = data["ActiveDeactive"]
    CompanySize = data["CompanySize"]

    cur = mysql.connection.cursor()
    
    cur.callproc("SP_getCompanyDetails",[CountryId, Status, ActiveDeactive, CompanySize])

    data = cur.fetchall()

    # print("After fetch data")

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# get Company details
@app.route("/company/getCompanyDetails/<CompanyId>")
def get_CompanyDetails(CompanyId):
    cur = mysql.connection.cursor()

    print(CompanyId)

    to_json = []

    if CompanyId != 'undefined' and CompanyId != '0' and CompanyId != '':
        # Use CompanyId if it's defined and non-empty
        print('CompanyId Passed')
        CompanyData = cur.execute('SELECT CompanyId, CurrencyId, CompanyCode, CompanyType, CompanyTypeName, CompanyName, NatureOfBussinessid, NatureOfBussinessName, CompanySize, CompanySizeName, Address1, Address2, Active, StatusCode, Status, StatusFor, StatusUpdatedBy, StatusUpdatedOn, StatusUpdatedRemarks, CountryId, CountryName, StateId, StateName, CityId, CityName, PinCode, Landmark, ContactPersonTitle, ContactPerson, MobileNo, PhoneNo, EmailId, PANNo, TANNo, FaxNo, TRNNo, EINNo, GSTIN, GSTPercentage, VATPercentage, GSTInclusive, VATInclusive, LanguageName FROM vw_companydetails WHERE CompanyId = %s LIMIT 1', (CompanyId,))

    if CompanyData > 0:
        city_data = cur.fetchall()
        rows = [x for x in cur]
        columns = [col[0] for col in cur.description]
        data = [dict(zip(columns, row)) for row in rows]
        to_json = json.dumps(data)

    return to_json, 200


# get Branch List
@app.route("/branch/getBranchList", methods = ["POST"])
@token_required
def get_BranchList():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    print(CompanyId)

    cur = mysql.connection.cursor()

    cur.callproc("SP_getCompanyBranchList", (CompanyId,))

    history_details = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]

    to_json = json.dumps(data)

    return to_json, 200

# ApproveReject For Company API
@app.route("/company/approveRejectForCompany", methods=["POST"])
def ApproveReject_Company():
    # Retrieve data posted to the API
    data = request.get_json()

    CompanyId = data["CompanyId"]
    # ProjectId = data["ProjectId"]
    ActiveFlag = data["ActiveFlag"]
    Status = data["Status"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]
    StatusUpdatedBy = data["StatusUpdatedBy"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_ApprovedRejecteCompanyList", (CompanyId, ActiveFlag, Status, StatusUpdatedRemarks, StatusUpdatedBy))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": "Company Approved Successfully"}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Approving Company"}), 500

# Update Conpany Register Data
@app.route("/company/UpdateCompanyRegister", methods = ["POST"])
def Update_CompanyRegister():
    # Retrieving Data Posted to API
    data = request.get_json()

    CompanyId = data["CompanyId"]
    CompanyName = data["CompanyName"]
    CompanyTypeId = data["CompanyTypeId"]
    NatureOfBussinessId = data["NatureOfBussinessId"]
    CompanySize = data["CompanySize"]
    Address1 = data["Address1"]
    Address2 = data["Address2"]
    CountryId = data["CountryId"]
    StateId = data["StateId"]
    CityId = data["CityId"]
    OtherCity = data["OtherCity"]
    PinCode = data["PinCode"]
    Landmark = data["Landmark"]
    ContactPersonTitle = data["ContactPersonTitle"]
    ContactPerson = data["ContactPerson"]
    MobileNo = data["MobileNo"]
    PhoneNo = data["PhoneNo"]
    EmailId = data["EmailId"]
    PANNo = data["PANNo"]
    TANNo = data["TANNo"]
    FaxNo = data["FaxNo"]
    GSTIN = data["GSTIN"]
    GSTPer = data["GSTPer"]
    GSTInclus = data["GSTInclus"]
    VATPer = data["VATPer"]
    VATIclus = data["VATIclus"]
    DefaultLanguage = data["DefaultLanguage"]
    UserId = data["UserId"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_UpdateCompany", (CompanyId, CompanyName, CompanyTypeId, NatureOfBussinessId, CompanySize, Address1, Address2, CountryId, StateId, CityId,OtherCity, PinCode, Landmark, ContactPersonTitle, ContactPerson, MobileNo, PhoneNo, EmailId, PANNo, TANNo, FaxNo,GSTIN,GSTPer,GSTInclus,VATPer,VATIclus, DefaultLanguage,UserId))
    # result = cur.stored_results().fetchone()[2]

    result = cur.fetchall()

    rtnFlag = result[0][0]

    if rtnFlag==0:
        print("rtnFlag = 0")
        return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Update Company Data"}), 500
    else:
        print("rtnFlag = 1")
        return jsonify({"RtnFlag" : True, "RtnMsg": "Congratulation!!! You Have Been successfully Updated Company Data."}), 201


# Inserting Conpany Branch Data
@app.route("/company/InsertCompanyBranch", methods = ["POST"])
def insert_CompanyBranch():
    # Retrieving Data Posted to API
    data = request.get_json()


    CompanyId = data["CompanyId"]
    BranchName = data["BranchName"]
    Address1 = data["Address1"]
    Address2 = data["Address2"]
    CountryId = data["CountryId"]
    StateId = data["StateId"]
    CityId = data["CityId"]
    OtherCity = data["OtherCity"]
    PinCode = data["PinCode"]
    Landmark = data["Landmark"]
    ContactPersonTitle = data["ContactPersonTitle"]
    ContactPerson = data["ContactPerson"]
    MobileNo = data["MobileNo"]
    PhoneNo = data["PhoneNo"]
    EmailId = data["EmailId"]
    FaxNo = data["FaxNo"]
    UserId = data["UserId"]


    cur = mysql.connection.cursor()


    cur.callproc("SP_InsertCompanyBranch", (CompanyId, BranchName, Address1, Address2, CountryId, StateId, CityId,OtherCity, PinCode, Landmark, ContactPersonTitle, ContactPerson, MobileNo, PhoneNo, EmailId, FaxNo, UserId))
    # result = cur.stored_results().fetchone()[2]


    result = cur.fetchall()


    rtnFlag = result[0][0]
    BranchId = result[0][2]


    if rtnFlag==0:
        print("rtnFlag = 0")
        return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving Company Branch", "RtnRefId" : 0}), 500
    else:
        print("rtnFlag = 1")
        return jsonify({"RtnFlag" : True, "RtnMsg": "Congratulation!!! You Have Been successfully Insert Branch.", "RtnRefId" : BranchId}), 201


# Update Conpany Branch Data
@app.route("/company/UpdateCompanyBranch", methods = ["POST"])
def Update_CompanyBranch():
    # Retrieving Data Posted to API
    data = request.get_json()


    CompanyId = data["CompanyId"]
    BranchName = data["BranchName"]
    Address1 = data["Address1"]
    Address2 = data["Address2"]
    CountryId = data["CountryId"]
    StateId = data["StateId"]
    CityId = data["CityId"]
    OtherCity = data["OtherCity"]
    PinCode = data["PinCode"]
    Landmark = data["Landmark"]
    ContactPersonTitle = data["ContactPersonTitle"]
    ContactPerson = data["ContactPerson"]
    MobileNo = data["MobileNo"]
    PhoneNo = data["PhoneNo"]
    EmailId = data["EmailId"]
    FaxNo = data["FaxNo"]
    UserId = data["UserId"]


    # print("CompanyId:", CompanyId)
    # print("BranchName:", BranchName)
    # print("Address1:", Address1)
    # print("Address2:", Address2)
    # print("CountryId:", CountryId)
    # print("StateId:", StateId)
    # print("CityId:", CityId)
    # print("PinCode:", PinCode)
    # print("Landmark:", Landmark)
    # print("ContactPersonTitle:", ContactPersonTitle)
    # print("ContactPerson:", ContactPerson)
    # print("MobileNo:", MobileNo)
    # print("PhoneNo:", PhoneNo)
    # print("EmailId:", EmailId)
    # print("FaxNo:", FaxNo)
    # print("UserId:", UserId)


    cur = mysql.connection.cursor()


    cur.callproc("SP_UpdateCompanyBranch", (CompanyId, BranchName, Address1, Address2, CountryId, StateId, CityId,OtherCity, PinCode, Landmark, ContactPersonTitle, ContactPerson, MobileNo, PhoneNo, EmailId, FaxNo, UserId))
    # result = cur.stored_results().fetchone()[2]


    result = cur.fetchall()


    rtnFlag = result[0][0]


    if rtnFlag==0:
        print("rtnFlag = 0")
        return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Update Company Branch"}), 500
    else:
        print("rtnFlag = 1")
        return jsonify({"RtnFlag" : True, "RtnMsg": "Congratulation!!! You Have Been successfully Update Company Branch Data."}), 201


# Activated & Deactivated For CompanyList API
@app.route("/company/ActivateDeactivateCompany", methods=["POST"])
def ActivateDeActivate_CompanyList():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    ActiveFlag = data["ActiveFlag"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]
    StatusUpdatedBy = data["StatusUpdatedBy"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_ActivateDeActivateCompanyList", (CompanyId, ActiveFlag, StatusUpdatedRemarks, StatusUpdatedBy))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": "Company Activate/DeActivate Successfully"}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Activate/DeActivate Company"}), 500

# get TaskSummary Count Click data List
@app.route("/task/getCountTaskSummaryList", methods = ["POST"])
def get_CountTaskSummaryList():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    Status = data["Status"]
    ToDays = data["ToDays"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_List_getTaskSummary", (CompanyId, Status, ToDays, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# get TaskSummary Count Click data List For Employee Dashboard
@app.route("/employee/getCountTaskSummaryListForEmpDashbaord", methods = ["POST"])
def get_CountTaskSummaryListForEmpDashboard():

    data = request.get_json()

    Status = data["Status"]
    ToDays = data["ToDays"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_List_getTaskSummary_EmpDashboard", (Status, ToDays, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200 


@app.route("/meeting/RescheduleMeeting", methods=["POST"])
@token_required
def Reschedule_Meeting():
    # Retrieve data posted to the API
    data = request.get_json()

    MeetingId = data["MeetingId"]
    Status = data["Status"]
    RescheduleDate = data["RescheduledDate"]
    RescheduledDuration = data["MeetingRescheduledDuration"]
    RescheduledDurationType = data["MeetingRescheduledDurationType"]
    RescheduledRemarks = data["MeetingRescheduledStatusUpdatedRemarks"]
    UserId = data["UserId"]
    
    cur = mysql.connection.cursor()

    cur.callproc("CRM_SP_RescheduleMeeting", (MeetingId, Status, RescheduledDuration, RescheduledDurationType, RescheduleDate, RescheduledRemarks,UserId))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Rescheduling Meeting"}), 500
    else:
        return jsonify({"RtnFlag": True, "RtnMsg": "Meeting Rescheduling Successfully"}), 200




# Inserting Add Participant
@app.route("/meeting/InsertMeeting", methods = ["POST"])
@token_required
def insert_Meeting():
    # Retrieving Data Posted to API
    data = request.get_json()


    CompanyId = data["CompanyId"]
    MeetingTitle = data["MeetingTitle"]
    Agenda = data["Agenda"]
    VenueChannel = data["VenueChannel"]
    MeetingType = data["MeetingType"]
    MeetingMode = data["MeetingMode"]
    Client = data["Client"]
    Project = data.get("Project", 0)
    DateTime = data["DateTime"]
    DurationValue = data["DurationValue"]
    DurationType = data.get("DurationType",0)
    UserId = data["UserId"]
    Participants = data["Participants"]
    EmpParticipant = data["EmpParticipant"]


    cur = mysql.connection.cursor()


    participants_json = json.dumps(Participants)
    Empparticipants_json = json.dumps(EmpParticipant)


    cur.callproc("SP_InsertMeeting", (CompanyId, MeetingTitle, Agenda, VenueChannel, MeetingType, MeetingMode, Client,Project, DateTime, DurationValue, DurationType, UserId, participants_json, Empparticipants_json))
    # result = cur.stored_results().fetchone()[2]


    result = cur.fetchall()


    rtnFlag = result[0][0]
    MeetingId = result[0][2]


    if rtnFlag==0:
        print("rtnFlag = 0")
        return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving Meeting", "RtnRefId" : 0}), 500
    else:
        print("rtnFlag = 1")
        return jsonify({"RtnFlag" : True, "RtnMsg": "Meeting Schedule Successfully", "RtnRefId" : MeetingId}), 201

# Meeting STatus

@app.route("/meeting/getMeetingStatusForDropDown")
def get_MeetingStatusForDropDown():

    cur = mysql.connection.cursor()
    # print (CompanyId)
    cur.execute('SELECT StatusCode, StatusName FROM gl_status_m WHERE StatusFor="Meeting"')

    customers_data = cur.fetchall()

    # print(projects_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    customers_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(customers_json)[0]["StatusCode"])
   
    customers_json = json.loads(customers_json);

    meetings = [
        {"value": meeting["StatusCode"], "label": meeting["StatusName"]}
        for meeting in customers_json
    ]
    return meetings, 200


@app.route("/meeting/getMeetingRescheduledHistoryDetails")
# @token_required
def get_MeetingRescheduledHistory():

    MeetingId = request.args.get("MeetingId")
    # try:
    cur = mysql.connection.cursor()

    print('calling history sp')
   
    cur.callproc("SP_getMeetingRescheduledHistoryDetails", [MeetingId])

    print('fetching history data')
    history_details = cur.fetchall()

    print('history fetched')
    print(history_details)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    print(data)

    return to_json, 200



# Get Meeting List
@app.route("/meeting/getMeetingList", methods=["POST"])
@token_required
def Get_MeetingList():

    data = request.get_json()

    SessionId = data["SessionId"]
    CompanyId = data["CompanyId"]
    Client = data["Client"]
    Project = data["Project"]
    Status = data["Status"]
    MeetingType = data["MeetingType"]
    MeetingMode = data["MeetingMode"]
    MeetingList = data["MeetingList"]
    UserId = data["UserId"]
   
    # print("Session id : ", SessionId)
    # print("User id : ", UserId)
    # print("getting arun meeting data",data)

    cur = mysql.connection.cursor()
   
    cur.callproc("SP_GetMeetingList", (SessionId, CompanyId, Client, Project, Status, MeetingType, MeetingMode, MeetingList, UserId))

    data = cur.fetchall()

    print("After fetch data")

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    return to_json, 200


# Get Participant List
@app.route("/meeting/getEmpParticipantInMeetingList", methods=["POST"])
@token_required
def Get_empParticipantListDetails():


    data = request.get_json()


    CompanyId = data["CompanyId"]
    MeetingId = data["MeetingId"]


    cur = mysql.connection.cursor()
   
    cur.callproc("SP_getAllEmpParticipantList", (CompanyId, MeetingId))


    data = cur.fetchall()


    # print("After fetch data")


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    return to_json, 200

# Get Client Participant List
@app.route("/meeting/getClientParticipantInMeetingList", methods=["POST"])
@token_required
def Get_ClientParticipantListDetails():

    data = request.get_json()
    CompanyId = data["CompanyId"]
    MeetingId = data["MeetingId"]

    cur = mysql.connection.cursor()
   
    cur.callproc("SP_getAllClientParticipantList", (CompanyId, MeetingId))

    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200


@app.route("/meeting/GetEmpDetailsWithCompany", methods=["POST"])
@token_required
def Get_EmpParticipantList():

    data = request.get_json()
    CompanyId = data["CompanyId"]

    cur = mysql.connection.cursor()
    cur.callproc("SP_GetEmpDetailsWithCompany", [CompanyId])

    data = cur.fetchall()
    # print("After fetch data")

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200


# Start End Meeting API
@app.route("/meeting/StartForMeeting", methods=["POST"])
@token_required
def Start_MeetingList():
    # Retrieve data posted to the API
    data = request.get_json()

    MeetingId = data["MeetingId"]
    Status = data["Status"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]
    StatusUpdatedBy = data["StatusUpdatedBy"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_StartMeetingList", (MeetingId, Status, StatusUpdatedRemarks, StatusUpdatedBy))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": "Meeting Started Successfully"}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Start Meeting"}), 500

@app.route("/meeting/EndForMeeting", methods=["POST"])
@token_required
def End_MeetingList():
    # Retrieve data posted to the API
    data = request.get_json()

    MeetingId = data["MeetingId"]
    CompanyId = data["CompanyId"]
    ChargableOrNot = data["InvoiceFlag"]
    Status = data["Status"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]
    StatusUpdatedBy = data["StatusUpdatedBy"]


    print("MeetingId:", MeetingId)
    print("CompanyId:", CompanyId)
    print("InvoiceFlag:", ChargableOrNot)
    print("Status:", Status)
    print("StatusUpdatedRemarks:", StatusUpdatedRemarks)
    print("StatusUpdatedBy:", StatusUpdatedBy)

    cur = mysql.connection.cursor()

    cur.callproc("SP_EndMeetingList", (MeetingId, CompanyId, ChargableOrNot, Status, StatusUpdatedRemarks, StatusUpdatedBy))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500

@app.route("/meeting/InvoiceGenerated", methods=["POST"])
@token_required
def Invoice_Generate():
    # Retrieve data posted to the API
    data = request.get_json()

    MeetingId = data["MeetingId"]
    CompanyId = data["CompanyId"]
    InvoiceDate = data["InvoiceDate"]
    InvoiceAmt = data["InvoiceAmt"]
    Status = data["Status"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]
    StatusUpdatedBy = data["StatusUpdatedBy"]
    TotalAmount = data["TotalAmount"]
    MeetingRatePerHourFinal = data["MeetingRatePerHourFinal"]
    MeetingTotalHour = data["MeetingTotalHour"]
    PaymentDueDate = data["PaymentDueDate"]


    # print("MeetingId:", MeetingId)
    # print("CompanyId:", CompanyId)
    # print("InvoiceFlag:", InvoiceFlag)
    # print("InvoiceAmt:", InvoiceAmt)
    # print("Status:", Status)
    # print("StatusUpdatedRemarks:", StatusUpdatedRemarks)
    # print("StatusUpdatedBy:", StatusUpdatedBy)


    cur = mysql.connection.cursor()


    cur.callproc("SP_InvoiceGenerated", (MeetingId, CompanyId, InvoiceDate, InvoiceAmt, Status, StatusUpdatedRemarks, StatusUpdatedBy, TotalAmount,MeetingRatePerHourFinal,MeetingTotalHour, PaymentDueDate))
    result = cur.fetchall()


    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    RefId = result[0][2]
    print("rtnFlag: ", rtnFlag)


    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg, "InvoiceId": RefId}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg, "InvoiceId": 0}), 500


# Get Bill List
@app.route("/bill/getBillList", methods=["POST"])
@token_required
def Get_BillList():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    Customer = data["Customer"]
    Status = data["Status"]
    InvoicePayment = data["InvoicePayment"]
    FromDate = data["FromDate"]
    ToDate = data["ToDate"]
    UserId = data["UserId"]

    # print(CompanyId)
    # print(Customer)
    # print(Status)
    # print(InvoicePayment)
    # print(FromDate)
    # print(ToDate)

    cur = mysql.connection.cursor()
    
    cur.callproc("SP_GetBillList", (CompanyId, Customer, Status, InvoicePayment, FromDate, ToDate, UserId))

    data = cur.fetchall()

    # print("After fetch data")

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Get Invoice List
@app.route("/invoice/getInvoiceDetailInMeetingList", methods=["POST"])
@token_required
def get_InvoiceDetailInMeetingList():


    data = request.get_json()


    CompanyId = data["CompanyId"]
    InvoiceId = data["InvoiceId"]


    cur = mysql.connection.cursor()
   
    cur.callproc("SP_GetInvoiceDetailInMeetingList", (CompanyId, InvoiceId))


    data = cur.fetchall()


    # print("After fetch data")


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    return to_json, 200



# Insert Receipt List
@app.route("/receipt/InsertReceiptBill", methods=["POST"])
@token_required
def Insert_ReceiptBill():


    data = request.get_json()


    CompanyId = data["CompanyId"]
    ReceiptDate = data["ReceiptDate"]
    ReceiptFrom = data["ReceiptFrom"]
    BillToInvoiceId = data["BillToInvoiceId"]
    ReceiptAmt = data["ReceiptAmt"]
    Remarks = data["Remarks"]
    PaymentMode = data["PaymentMode"]
    TransNo = data["TransNo"]
    BankName = data["BankName"]
    TransDate = data["TransDate"]
    UserId = data["UserId"]


    # print(CompanyId)
    # print(ReceiptDate)
    # print(ReceiptFrom)
    # print(BillToInvoiceId)
    # print(ReceiptAmt)
    # print(Remarks)
    # print(PaymentMode)
    # print(TransNo)
    # print(TransDate)
    # print(UserId)




    cur = mysql.connection.cursor()
   
    cur.callproc("SP_InsertReceipt", (CompanyId, ReceiptDate,ReceiptFrom, BillToInvoiceId, ReceiptAmt, Remarks, PaymentMode, TransNo, BankName, TransDate, UserId))


    result = cur.fetchall()


    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    ReceiptId = result[0][2]
    print("rtnFlag: ", rtnFlag)


    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg, "RtnRefId" : ReceiptId}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg, "RtnRefId" : 0}), 500

# Get Receipts List
@app.route("/receipts/getReceiptsList", methods=["POST"])
@token_required
def get_ReceiptsList():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    Customer = data["Customer"]
    FromDate = data["FromDate"]
    ToDate = data["ToDate"]
    ReceiveMode = data["ReceiveMode"]
    TransNo = data["TransNo"]
    ReceiptNo = data["ReceiptNo"]
    Status = data["Status"],
    UserId = data["UserId"]

    cur = mysql.connection.cursor()
    
    cur.callproc("SP_GetReceiptDetails", (CompanyId, Customer, FromDate, ToDate, ReceiveMode, TransNo, ReceiptNo, Status, UserId))

    data = cur.fetchall()

    # print("After fetch data")

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Get View Receipt
@app.route("/receipts/getViewReceipt", methods=["POST"])
@token_required
def get_ViewReceipt():


    data = request.get_json()


    CompanyId = data["CompanyId"]
    ReceiptId = data["ReceiptId"]


    cur = mysql.connection.cursor()
   
    cur.callproc("SP_GetViewReceipt", (CompanyId, ReceiptId))


    data = cur.fetchall()


    # print("After fetch data")


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    return to_json, 200

# Get Receipt List Against Invoice Id
@app.route("/receipts/getReceiptListAgainstInvoice", methods=["POST"])
@token_required
def get_ReceiptListAgainstInvoice():


    data = request.get_json()


    CompanyId = data["CompanyId"]
    InvoiceId = data["InvoiceId"]


    cur = mysql.connection.cursor()
   
    cur.callproc("SP_GetReceiptListAgainstInvoice", (CompanyId, InvoiceId))


    data = cur.fetchall()


    # print("After fetch data")


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    return to_json, 200


# Cancel Meeting

@app.route("/meeting/CancelMeeting", methods=["POST"])
@token_required
def Cancel_Meeting():
    # Retrieve data posted to the API
    data = request.get_json()


    MeetingId = data["MeetingId"]
    Status = data["Status"]
    StatusUpdatedBy = data["StatusUpdatedBy"]
    StatusUpdatedRemarks = data["StatusUpdatedRemarks"]


    cur = mysql.connection.cursor()


    cur.callproc("TS_SP_CancelMeeting", (MeetingId, Status, StatusUpdatedBy, StatusUpdatedRemarks))
    result = cur.fetchall()


    rtnFlag = result[0][0]
    print("rtnFlag: ", rtnFlag)


    if rtnFlag == 0:
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Cancelling Meeting"}), 500
    else:
        return jsonify({"RtnFlag": True, "RtnMsg": "Meeting Cancelled Successfully"}), 200


# ApproveReject For LeaveApplication API
@app.route("/receipt/CancelReceipt", methods=["POST"])
@token_required
def CancelReceiptList():
    # Retrieve data posted to the API
    data = request.get_json()


    ReceiptId = data["ReceiptId"]
    CancelDate = data["CancelDate"]
    Remarks = data["Remarks"]
    UserId = data["UserId"]


    cur = mysql.connection.cursor()


    cur.callproc("SP_CancelReceipt", (ReceiptId,CancelDate, Remarks, UserId))
    result = cur.fetchall()


    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500


# Company Setting
@app.route("/company/CompanySetting", methods=["POST"])
def Insert_CompanySetting():
    # Retrieve data posted to the API
    data = request.get_json()

    CompanyId = data["CompanyId"]
    TimeSheet = data["TimeSheet"]
    IssueTracking = data["IssueTracking"]
    AttendanceProcess = data["AttendanceProcess"]
    PayRoll = data["PayRoll"]
    Meeting = data["Meeting"]
    AutoPresent = data["AutoPresent"]
    AutoAttendance = data["AutoAttendance"]
    AutoStartTimetask = data["AutoStartTimetask"]
    AutoEndDateTask = data["AutoEndDateTask"]
    UserId = data["UserId"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_InsertCompanySetting", (CompanyId, TimeSheet, IssueTracking, AttendanceProcess, PayRoll, Meeting, AutoPresent, AutoAttendance, AutoStartTimetask, AutoEndDateTask, UserId))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500

# Company Setting in Admin Login
@app.route("/adminLogin/CompanySettingForAdminLogin", methods=["POST"])
def Insert_CompanySettingForAdminLogin():
    # Retrieve data posted to the API
    data = request.get_json()

    CompanyId = data["CompanyId"]
    AutoPresent = data["AutoPresent"]
    AutoAttendance = data["AutoAttendance"]
    AutoStartTimetask = data["AutoStartTimetask"]
    AutoEndDateTask = data["AutoEndDateTask"]
    AllowPastTimeSheetEntry = data["AutoPastTimeSheetEntry"]
    AllowEditingTimeSheetEntry = data["AutoEditingTimeSheetEntry"]
    UserId = data["UserId"]
    CategoryIds = data["CategoryIds"]
    SelectedDesignationIds = data["SelectedDesignationIds"]
    IncludeBetweenWeekOffCheckbox = data["IncludeBetweenWeekOffCheckbox"]
    IncludeBeforeAfterWeekOffCheckbox = data["IncludeBeforeAfterWeekOffCheckbox"]
    IncludeBetweenHolidayCheckbox = data["IncludeBetweenHolidayCheckbox"]
    IncludeBeforeAfterHolidayCheckbox = data["IncludeBeforeAfterHolidayCheckbox"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_InsertCompanySettingForAdminLogin", (CompanyId, AutoPresent, AutoAttendance, AutoStartTimetask, AutoEndDateTask,AllowPastTimeSheetEntry,AllowEditingTimeSheetEntry, UserId, CategoryIds, SelectedDesignationIds, IncludeBetweenWeekOffCheckbox, IncludeBeforeAfterWeekOffCheckbox, IncludeBetweenHolidayCheckbox, IncludeBeforeAfterHolidayCheckbox))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500

# Cancel Bill API
@app.route("/bill/CancelBill", methods=["POST"])
@token_required
def CancelBillList():
    # Retrieve data posted to the API
    data = request.get_json()

    InvoiceId = data["InvoiceId"]
    CancelDate = data["CancelDate"]
    Remarks = data["Remarks"]
    UserId = data["UserId"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_CancelBills", (InvoiceId, CancelDate, Remarks, UserId))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500

# Get Meeting History List
@app.route("/meeting/getMeetingHistoryList", methods=["POST"])
@token_required
def Get_MeetingHistoryList():


    data = request.get_json()
    print("Print Data", data)
    MeetingId = data["MeetingId"]
    print("Print MeetingId", MeetingId)


    cur = mysql.connection.cursor()
   
    cur.callproc("SP_getMeetingHistoryList", [MeetingId])


    data = cur.fetchall()


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    return to_json, 200


# Get Meeting Setting List
@app.route("/company/getCompanySettingData", methods=["POST"])
def Get_MeetingSettingList():


    data = request.get_json()
    # print("Print Data", data)
    CompanyId = data["CompanyId"]
    # print("Print MeetingId", MeetingId)


    cur = mysql.connection.cursor()
   
    cur.callproc("SP_GetCompanySettingData", [CompanyId])


    data = cur.fetchall()


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    return to_json, 200


# Update Contact Details In Company Details
@app.route("/CompanyDetails/UpdateContactDetails", methods=["POST"])
@token_required
def Update_ContactDetails():
    # Retrieve data posted to the API
    data = request.get_json()


    CompanyId = data["CompanyId"]
    ContactPerson = data["ContactPerson"]
    PhoneNo = data["PhoneNo"]
    MobileNo = data["MobileNo"]
    EmailId = data["EmailId"]
    FaxNo = data["FaxNo"]


    cur = mysql.connection.cursor()


    cur.callproc("SP_UpdateContactDetails", (CompanyId, ContactPerson, PhoneNo, MobileNo, EmailId, FaxNo))
    result = cur.fetchall()


    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    print("rtnFlag: ", rtnFlag)


    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500


# Update Contact Details In Company Details
@app.route("/CompanyDetails/UpdateOtherDetails", methods=["POST"])
@token_required
def Update_OtherDetails():
    # Retrieve data posted to the API
    data = request.get_json()


    CompanyId = data["CompanyId"]
    PANNo = data["PANNo"]
    TANNo = data["TANNo"]
    GSTNo = data["GSTNo"]
    GSTInclusive = data["GSTInclusive"]
    GSTPercentage = data["GSTPercentage"]
    VATInclusive = data["VATInclusive"]
    VATPercentage = data["VATPercentage"]


    cur = mysql.connection.cursor()


    cur.callproc("SP_UpdateOtherDetails", (CompanyId, PANNo, TANNo, GSTNo, GSTInclusive, GSTPercentage, VATInclusive, VATPercentage))
    result = cur.fetchall()


    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    print("rtnFlag: ", rtnFlag)


    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500

# Filtering For Bill Summary API
@app.route("/BillSummary/getBillSummary", methods=["POST"])
def Filter_BillSummary():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    CustomerId = data["CustomerId"]
    Year = data["Year"]
    UserId = data["UserId"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_AdminDashboard_getBillSummary", [CompanyId, SessionId, CustomerId, Year, UserId])
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Filtering For Meeting Summary API
@app.route("/MeetingSymmary/getMeetingSummary", methods=["POST"])
def Filter_MeetingSummary():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    CustomerId = data["CustomerId"]
    ProjectId = data["ProjectId"]
    FromDate = data["FromDate"]
    ToDate = data["ToDate"]
    UserId = data["UserId"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_AdminDashboard_getMeetingSummary", (CompanyId, SessionId, CustomerId, ProjectId, FromDate, ToDate, UserId))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Filtering For Project Summary API
@app.route("/ProjectSymmary/getProjectSummary", methods=["POST"])
def Filter_ProjectSummary():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    CustomerId = data["CustomerId"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_AdminDashboard_getProjectSummary", (CompanyId, SessionId, CustomerId))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# get BillSummary Count Click data List
@app.route("/billSummary/getCountBillummaryList", methods = ["POST"])
def get_CountBillSummaryList():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    Status = data["Status"]
    CustomerId = data["CustomerId"]
    Year = data["Year"]
    UserId = data["UserId"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_List_getBillSummary", (CompanyId, Status, CustomerId, Year, UserId))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# get BillSummary Count Click data List for receive amount
@app.route("/billSummary/getCountBillummaryListForReceive", methods = ["POST"])
def get_CountBillSummaryListForReceive():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    Status = data["Status"]
    CustomerId = data["CustomerId"]
    Year = data["Year"]
    UserId = data["UserId"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_List_getBillSummary", (CompanyId, Status, CustomerId, Year, UserId))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# get MeetingSummary Count Click data List
@app.route("/MeetingSummary/getCountMeetingSummaryList", methods = ["POST"])
def get_CountMeetingSummaryList():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    Status = data["Status"]
    CustomerId = data["CustomerId"]
    ProjectId = data["ProjectId"]
    FromDate = data["FromDate"]
    ToDate = data["ToDate"]
    UserId = data["UserId"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_List_getMeetingSummary", (CompanyId, Status, CustomerId, ProjectId, FromDate, ToDate, UserId))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# get ProjectSummary Count Click data List
@app.route("/projectSummary/getCountProjectummaryList", methods = ["POST"])
def get_CountProjectSummaryList():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    Status = data["Status"]
    CustomerId = data["CustomerId"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_List_getProjectSummary", (CompanyId, Status, CustomerId))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Filtering For Company Summary API
@app.route("/SADashboard/getCompanySummary", methods=["POST"])
def Filter_CompanySummary():


    data = request.get_json()


    SessionId = data["SessionId"]
    AllCompany = data["AllCompany"]
    FromDate = data["FromDate"]
    ToDate = data["ToDate"]


    cur = mysql.connection.cursor()


    cur.callproc("SP_SADashboard_getCompanySummary", (SessionId, AllCompany, FromDate, ToDate))
    data = cur.fetchall()


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    return to_json, 200


# get BillSummary Count Click data List
@app.route("/SADashboard/getCountCompanyummaryList", methods = ["POST"])
def get_CountCompanySummaryList():


    data = request.get_json()


    Status = data["Status"]
    AllCompany = data["AllCompany"]
    FromDate = data["FromDate"]
    ToDate = data["ToDate"]


    cur = mysql.connection.cursor()


    cur.callproc("SP_List_getCompanySummary", (Status, AllCompany, FromDate, ToDate))
    data = cur.fetchall()


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    return to_json, 200

# Get Location List
@app.route("/project/getProjectLocationList", methods=["POST"])
@token_required
def get_ProjectLocationList():


    data = request.get_json()


    CompanyId = data["CompanyId"]
    ProjectId = data["ProjectId"]


    cur = mysql.connection.cursor()
   
    cur.callproc("SP_GetProjectLocationDetails", (CompanyId, ProjectId))


    data = cur.fetchall()


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    return to_json, 200

# Customer Ledger List
@app.route("/Customer/getCustomerLedgerList", methods=["POST"])
# @token_required
def get_CustomerLedgerList():




    data = request.get_json()


    SessionId = data["SessionId"]
    CustomerId = data["CustomerId"]
    FromDate = data["FromDate"]
    ToDate = data["ToDate"]


    cur = mysql.connection.cursor()
   
    cur.callproc("SP_RPT_CustomerLedger", (SessionId,CustomerId, FromDate, ToDate))


    data = cur.fetchall()


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    return to_json, 200


# Company Ledger List
@app.route("/Company/getCompanyLedgerList", methods=["POST"])
@token_required
def get_CompanyLedgerList():




    data = request.get_json()


    SessionId = data["SessionId"]
    CompanyId = data["CompanyId"]
    FromDate = data["FromDate"]
    ToDate = data["ToDate"]


    print('SessionId : ',SessionId)
    print('CompanyId : ',CompanyId)
    print('FromDate : ', FromDate)
    print('ToDate : ',ToDate)


    cur = mysql.connection.cursor()
   
    cur.callproc("SP_RPT_CompanyLedger", (SessionId,CompanyId, FromDate, ToDate))


    data = cur.fetchall()


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    return to_json, 200

# get data in company configuratino for Language dropdown
@app.route("/Language/getDefaultLanguageDropDown")
# @token_required
def get_DefaultLanguageDropDown():
    cur = mysql.connection.cursor()

    cur.execute("SELECT LanguageId, LanguageName FROM gl_language_m")

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    Language_json = json.dumps(data)
    
    Language_json = json.loads(Language_json)

    Language = [
        {"value": project["LanguageId"], "label": project["LanguageName"]}
        for project in Language_json
    ]
    return Language, 200

# City DropDown for Company Creation
@app.route("/Company/getCityNameForDropDown/<StateId>")
def get_CityDropDownForCompany(StateId):
    print('StateId:', StateId)  # Combined print statements for readability

    cur = mysql.connection.cursor()

    if StateId == "undefined":
        StateId = 0

    # Use parameterized queries to prevent SQL injection
    cur.execute("SELECT CityId, CityName FROM gl_city_m WHERE StateId = %s", (StateId,))

    City_data = cur.fetchall()

    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in City_data]

    City_json = json.dumps(data)
    
    City_json = json.loads(City_json)

    city = [
        {"value": cities["CityId"], "label": cities["CityName"]}
        for cities in City_json
    ]
    return city, 200

# Get Data For Attendance Entry API
@app.route("/AttendanceEntry/getAttendanceEntry", methods=["POST"])
@token_required
def get_AttendanceEntry():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_getAttendanceEntry", (CompanyId, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# fetch attendance Staus Data from database
@app.route("/AttendanceEntry/getAttenStatusNameDropDown")
def get_AttendStatusDropDown():
    cur = mysql.connection.cursor()
    

    # cur.execute("Select StatusCode, StatusName from gl_Status_m Where StatusFor='Attendance' and StatusCode in ('P','A')")
    cur.execute("Select StatusCode, StatusName from gl_Status_m Where StatusFor='Attendance'")

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    AttendStatus_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(AttendStatus_json)[0]["StatusCode"])
    
    AttendStatus_json = json.loads(AttendStatus_json)

    AttendStatus = [
        {"value": project["StatusCode"], "label": project["StatusName"]}
        for project in AttendStatus_json
    ]

    return AttendStatus, 200

# Update Attendance in Attendance Entry API
@app.route("/AttendanceEntry/UpdateAttendanceEntry", methods=["POST"])
@token_required
def Update_AttendanceEntry():
    # Retrieve data posted to the API
    data = request.get_json()

    CompanyId = data["CompanyId"]
    EmployeeId = data["EmployeeId"]
    AttendDate = data["AttendDate"]
    AttendStatus = data["AttendStatus"]
    InTime = data["InTime"]
    OutTime = data["OutTime"]
    UserId = data["UserId"]

    # Print all values
    # print(f"CompanyId: {CompanyId}")
    # print(f"EmployeeId: {EmployeeId}")
    # print(f"AttendDate: {AttendDate}")
    # print(f"AttendStatus: {AttendStatus}")
    # print(f"InTime: {InTime}")
    # print(f"OutTime: {OutTime}")
    # print(f"UserId: {UserId}")
    
    cur = mysql.connection.cursor()

    cur.callproc("SP_UpdateAttendanceEntry", (CompanyId, EmployeeId, AttendDate,AttendStatus,InTime,OutTime, UserId))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500

# Update Attendance in Dailt Attendance Calendar API
@app.route("/DailyAttendance/UpdateDailyAttendance", methods=["POST"])
@token_required
def Update_DailyAttendance():
    # Retrieve data posted to the API
    data = request.get_json()

    CompanyId = data["CompanyId"]
    EmployeeId = data["EmployeeId"]
    AttendDate = data["AttendDate"]
    AttendStatus = data["AttendStatus"]
    Remarks = data["Remarks"]
    UserId = data["UserId"]

    # Print all values
    # print(f"CompanyId: {CompanyId}")
    # print(f"EmployeeId: {EmployeeId}")
    # print(f"AttendDate: {AttendDate}")
    # print(f"AttendStatus: {AttendStatus}")
    # print(f"InTime: {InTime}")
    # print(f"OutTime: {OutTime}")
    # print(f"UserId: {UserId}")
    
    cur = mysql.connection.cursor()

    cur.callproc("SP_UpdateDailyAttendance", (CompanyId, EmployeeId, AttendDate,AttendStatus, Remarks, UserId))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500
# Fetch data for reAllocation history
@app.route("/reAllocation/getReAllocationHistoryDetails", methods=["POST"])
# @token_required
def get_ReAllocationHistory():

    data = request.get_json()

    TaskId = data["TaskId"]

    cur = mysql.connection.cursor()
    
    cur.callproc("Sp_GetTaskReAllocationHistoryDetails", [TaskId])

    data = cur.fetchall()

    # print("After fetch data")

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Filtering For Task Summary API for QC Dashboard
@app.route("/QCDashboard/getQCTaskSummary", methods=["POST"])
def Filter_QCTaskSummary():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    SessionId = data["SessionId"]
    ToDays = data["ToDays"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]
    print(CompanyId)
    print(SessionId)
    print(ToDays)
    print(EmployeeId)
    print(Month)

    cur = mysql.connection.cursor()

    cur.callproc("SP_RPT_getTaskSummary_QCDashboard", (CompanyId, SessionId, ToDays, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    to_json = json.dumps(data)

    return to_json, 200

# get TaskSummary Count Click data List for QC Dashboard
@app.route("/QCDashboard/getCountTaskSummaryListQCDashboard", methods = ["POST"])
def get_TaskSummaryCountQCDashboard():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    Status = data["Status"]
    ToDays = data["ToDays"]
    EmployeeId = data["EmployeeId"]
    Month = data["Month"]
    Year = data["Year"]

    cur = mysql.connection.cursor()

    cur.callproc("SP_List_getTaskSummary_QCDashboard", (CompanyId, Status, ToDays, EmployeeId, Month, Year))
    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

# Get Bill History List
@app.route("/bill/getBillHistoryList", methods=["POST"])
@token_required
def get_BillHistoryList():

    data = request.get_json()

    InvoiceId = data["InvoiceId"]

    cur = mysql.connection.cursor()
   
    cur.callproc("SP_getBillHistoryDetails", [InvoiceId])

    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200

@app.route("/project/getViewProjectListForPrint", methods=['GET'])
@token_required
def get_viewProjectDetailsForPrint():

    ProjectId = request.args.get("ProjectId")
   
    if not ProjectId:
        return jsonify({"error": "ProjectId parameter is required"}), 400

    try:
        with mysql.connection.cursor() as cur:
            cur.callproc("SP_getProjectDetailsForPrint", [ProjectId])
            columns = [col[0] for col in cur.description]
            rows = cur.fetchall()
            data = [dict(zip(columns, row)) for row in rows]
           
            # Optionally print the data to console (remove in production)
            print(data)

            print("Getting Print Project Data",data)

            return jsonify(data), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


# Get Receipt History List
@app.route("/receipt/getReceiptHistoryList", methods=["POST"])
@token_required
def get_ReceiptHistoryList():

    data = request.get_json()

    ReceiptId = data["ReceiptId"]

    cur = mysql.connection.cursor()
   
    cur.callproc("SP_getReceiptHistoryDetails", [ReceiptId])

    data = cur.fetchall()

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)

    return to_json, 200


@app.route("/master/getNatureOfBusinessList", methods=["POST"])
# @token_required
def get_NatureOfBusinessList():


    data = request.get_json()

    NatureOfBusiness = data["NatureOfBusiness"]
   
    cur = mysql.connection.cursor()
   
    cur.callproc("SP_getNatureOfBusiness",[NatureOfBusiness])


    data = cur.fetchall()


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)


    return to_json, 200


@app.route("/project/update_nature_of_business", methods=["POST"])
@token_required
def update_nature_of_business():
    # Retrieve data posted to the API
    data = request.get_json()
   
    NatureId = data["NatureId"]
    NatureOfBusiness = data["NatureOfBusiness"]
    Description = data["Description"]


    print("getting of payterms",data)
    cur = mysql.connection.cursor()


    cur.callproc("SP_UpdateNatureofbusiness", (NatureId,NatureOfBusiness,Description))
    result = cur.fetchall()




    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    print("rtnFlag: ", rtnFlag)




    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500
   



@app.route("/project/insertnatureofbusiness", methods = ["POST"])
# @token_required
def insert_Nature_Of_Business():
    try:
        cur = mysql.connection.cursor()
        # Retrieving Data Posted to API
        data = request.get_json()
       
        NatureOfBussinessName = data["NatureOfBusiness"]
        Description = data["Description"]


        print(NatureOfBussinessName)
        print(Description)


        print("getting project data soon",data)
        cur.callproc("SP_InsertNatureOfBusiness", ( NatureOfBussinessName, Description))
       
        print('getting result')


        result = cur.fetchall()


        rtnFlag = result[0][0]
       
        print("rtnFlag : " + str(rtnFlag))


        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving Nature of Business"}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag" : True, "RtnMsg": "Nature of Business saved successfully"}), 201
       
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")


        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Saving Nature of Business. Error : " + str(e)}), 500
   
    finally:
        cur.close()




@app.route("/master/getEmailTemplateList", methods=["POST"])
# @token_required
def get_EmailTemplateList():


    data = request.get_json()

    EmailTemplate = data["EmailTemplate"]

    cur = mysql.connection.cursor()
   
    cur.callproc("SP_getEmailTemplateList",[EmailTemplate])


    data = cur.fetchall()


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)




    return to_json, 200


# insert email template
@app.route("/project/insertemailtemplate", methods = ["POST"])
# @token_required
def insert_emailtemplate():
    try:
        cur = mysql.connection.cursor()
        # Retrieving Data Posted to API
        data = request.get_json()
       
        TemplateName = data["TemplateName"]
        SPName = data["SPName"]
        Active = data["Active"]

        cur.callproc("SP_InsertEmailTemplate", ( TemplateName, SPName, Active))


        result = cur.fetchall()




        rtnFlag = result[0][0]




        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving Email Template"}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag" : True, "RtnMsg": "Email Template saved successfully"}), 201
       
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")




        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Saving Email Template. Error : " + str(e)}), 500
   
    finally:
        cur.close()


@app.route("/project/updateemailtemplate", methods=["POST"])
@token_required
def update_emailtemplate():
    # Retrieve data posted to the API
    data = request.get_json()
   
    TemplateId = data["TemplateId"]
    TemplateName = data["TemplateName"]
    SPName = data["SPName"]
    Active = data["Active"]


    print(TemplateId)
    print(TemplateName)
    print(SPName)
    print(Active)


    cur = mysql.connection.cursor()


    cur.callproc("SP_UpdateEmailTemplate", (TemplateId,TemplateName,SPName,Active))
    result = cur.fetchall()

    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    print("rtnFlag: ", rtnFlag)

    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

@app.route("/master/getPaymentTermsList", methods=["POST"])
# @token_required
def get_PaymentTermsList():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    PaytermName = data["PaytermName"]

    cur = mysql.connection.cursor()
   
    cur.callproc("SP_getPaymentTermsList",[CompanyId, PaytermName])

    data = cur.fetchall()


    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    # to_json = json.dumps(data, indent=2)
    to_json = json.dumps(data)




    return to_json, 200






# insert pay term
@app.route("/payterm/insertpayterm", methods = ["POST"])
# @token_required
def insert_payterm():
    try:
        cur = mysql.connection.cursor()
        # Retrieving Data Posted to API
        data = request.get_json()
       
        CompanyId = data["CompanyId"]
        PayTerm = data["PayTerm"]
        Description = data["Description"]
        UserId = data["UserId"]


        print("gettring payterm data",data)
        print(Description)


        cur.callproc("SP_InsertPayTerm", (CompanyId, PayTerm, Description,UserId))
       
   
        result = cur.fetchall()




        rtnFlag = result[0][0]




        if rtnFlag==0:
            print("rtnFlag = 0")
            return jsonify({"RtnFlag" : False, "RtnMsg": "Error While Saving  Payment Term"}), 500
        else:
            print("rtnFlag = 1")
            return jsonify({"RtnFlag" : True, "RtnMsg": "Payment Term saved successfully"}), 201
       
    except Exception as e:
        # mysql.connection.rollback()
        print(f"Error: {str(e)}")




        return jsonify({"RtnFlag" : False, "RtnMsg": "Error while Saving Payment Term. Error : " + str(e)}), 500
   
    finally:
        cur.close()


@app.route("/payterm/updatepayterm", methods=["POST"])
# @token_required
def update_payterm():
    # Retrieve data posted to the API
    data = request.get_json()
   
    CompanyId = data["CompanyId"],
    Paytermid = data["Paytermid"]
    Payterm = data["PayTerm"],
    Description = data["Description"],
    UserId = data["UserId"]


    cur = mysql.connection.cursor()


    cur.callproc("SP_UpdatePayTerm", (CompanyId,Paytermid, Payterm, Description,  UserId))
    result = cur.fetchall()




    rtnFlag = result[0][0]
    rtnMsg = result[0][1]
    print("rtnFlag: ", rtnFlag)




    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500

# Get Leave Balance List
@app.route("/balance/getLeaveBalance", methods=["POST"])
def get_LeaveBalance():

    data = request.get_json()
    EmployeeId = data.get("EmployeeId")

    cur = mysql.connection.cursor()
   
    # Call stored procedure
    cur.callproc("SP_GetLeaveBalance", [EmployeeId])
    
    # Fetch all results from the cursor
    rows = cur.fetchall()

    # Get column names from the cursor description
    columns = [col[0] for col in cur.description]

    # Convert rows into a list of dictionaries
    data = [dict(zip(columns, row)) for row in rows]

    # Serialize data to JSON using the custom Decimal encoder
    to_json = json.dumps(data, cls=DecimalEncoder, indent=2)

    # Close the cursor
    cur.close()

    # Return JSON response
    return to_json, 200

# Get Leave Balance Report list
@app.route("/balance/getLeaveBalanceReport", methods=["POST"])
def get_LeaveBalanceReport():

    data = request.get_json()

    CompanyId = data["CompanyId"]
    EmployeeId = data["EmployeeId"]
    EmployeeStatus = data["EmployeeStatus"]
    
    print("CompanyId :", CompanyId)
    print("EmployeeId :", EmployeeId)
    print("EmployeeStatus :", EmployeeStatus)

    cur = mysql.connection.cursor()
   
    # Call stored procedure
    cur.callproc("SP_GetLeaveBalanceReport", [CompanyId, EmployeeId, EmployeeStatus])
    
    # Fetch all results from the cursor
    rows = cur.fetchall()

    # Get column names from the cursor description
    columns = [col[0] for col in cur.description]

    # Convert rows into a list of dictionaries
    data = [dict(zip(columns, row)) for row in rows]

    # Serialize data to JSON using the custom Decimal encoder
    to_json = json.dumps(data, cls=DecimalEncoder, indent=2)

    # Close the cursor
    cur.close()

    # Return JSON response
    return to_json, 200

@app.route("/notificationtemplate/getNotificationList", methods=["POST"])
# @token_required
def get_NotificationList():
    data = request.get_json()


    NotificationTemplate = data["NotificationTemplate"],
    SPName = data["SPName"],

    print("NotificationTemplate", NotificationTemplate)
    print("SPName", SPName)

    cur = mysql.connection.cursor()
   
    cur.callproc("SP_getNotificationTemplate", [NotificationTemplate,SPName])


    rows = cur.fetchall()
    columns = [col[0] for col in cur.description]
    data = [dict(zip(columns, row)) for row in rows]
    to_json = json.dumps(data)


    return to_json, 200


@app.route("/notificationtemplate/insertNotification", methods=["POST"])
# @token_required
def insert_Notification():
    try:
        cur = mysql.connection.cursor()
        # Retrieving Data Posted to API
        data = request.get_json()
       
        TemplateName = data["TemplateName"]
        SPName = data["SPName"]
        selectedIds = data["selectedIds"]
        # NotificationForUserIds = data["NotificationForUserIds"]
        NotificationClass = data["NotificationClass"]
        NotificationTitleClass = data["NotificationTitleClass"]
        NotificationIconClass = data["NotificationIconClass"]
        NotificationIcon = data["NotificationIcon"]
        UserId = data["UserId"]


        print("Data received:", data)
        cur.callproc("SP_InsertNotificationTemplate", (TemplateName, SPName, selectedIds,NotificationClass, NotificationTitleClass, NotificationIconClass, NotificationIcon, UserId))
       
        result = cur.fetchall()


        rtnFlag = result[0][0]
       
        if rtnFlag == 0:
            return jsonify({"RtnFlag": False, "RtnMsg": "Error While Saving Notification"}), 500
        else:
            return jsonify({"RtnFlag": True, "RtnMsg": "Notification saved successfully"}), 201
       
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"RtnFlag": False, "RtnMsg": "Error while Saving Notification. Error: " + str(e)}), 500
    finally:
        cur.close()




@app.route("/notificationtemplate/updateNotification", methods=["POST"])
# @token_required
def update_notification():
    # Retrieve data posted to the API
    data = request.get_json()
   
    TemplateId = data["TemplateId"]
    TemplateName = data["TemplateName"]
    SPName = data["SPName"]
    selectedIds = data["selectedIds"]
    # NotificationForUserIds = data["NotificationForUserIds"]
    NotificationClass = data["NotificationClass"]
    NotificationTitleClass = data["NotificationTitleClass"]
    NotificationIconClass = data["NotificationIconClass"]
    NotificationIcon = data["NotificationIcon"]
    UserId = data["UserId"]


    cur = mysql.connection.cursor()


    cur.callproc("SP_UpdateNotificationTemplate", (TemplateId, TemplateName, SPName, selectedIds, NotificationClass, NotificationTitleClass,NotificationIconClass, NotificationIcon, UserId))
   
    result = cur.fetchall()


    rtnFlag = result[0][0]
    rtnMsg = result[0][1]


    if rtnFlag == 1:
        return jsonify({"RtnFlag": True, "RtnMsg": rtnMsg}), 200
    else:
        return jsonify({"RtnFlag": False, "RtnMsg": rtnMsg}), 500

@app.route("/company/getCompanyStatusForDropDown")
def get_CompanyStatusForDropDown():

    cur = mysql.connection.cursor()
    # print (CompanyId)
    cur.execute('SELECT StatusCode, StatusName FROM gl_status_m WHERE StatusFor="Company"')

    customers_data = cur.fetchall()

    # print(projects_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    company_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(company_json)[0]["StatusCode"])
   
    company_json = json.loads(company_json);

    Companies = [
        {"value": company["StatusCode"], "label": company["StatusName"]}
        for company in company_json
    ]
    return Companies, 200

@app.route("/setting/getDesignationDropDown/<CategoryIds>")
def get_DesignationDropDownForSetting(CategoryIds):
    cur = mysql.connection.cursor()

    # Use parameterized query to avoid SQL injection
    query = "SELECT DesignationId, DesignationName FROM gl_designation_m WHERE CategoryId IN (%s)"
    cur.execute(query, [CategoryIds])

    # Fetch data from cursor
    rows = cur.fetchall()
    
    # Assuming 'DesignationId' and 'DesignationName' are columns
    data = [{"value": row[0], "label": row[1]} for row in rows]
    
    # Return JSON response
    return jsonify(data), 200

# fetch Employee Category Name 
@app.route("/setting/getEmployeeCategoryForDropDown")
def get_EmployeeCategoryForDropDown():

    cur = mysql.connection.cursor()
    # print (CompanyId)
    cur.execute('SELECT CategoryId, CategoryName FROM gl_employeecategory_m')

    customers_data = cur.fetchall()
    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    company_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(company_json)[0]["CategoryId"])
   
    company_json = json.loads(company_json);

    Companies = [
        {"value": company["CategoryId"], "label": company["CategoryName"]}
        for company in company_json
    ]
    return Companies, 200

@app.route("/reminder/getReminderCategoryForDropDown")
def get_ReminderCategoryDropDown():

    cur = mysql.connection.cursor()
    # print (CompanyId)
    cur.execute('SELECT ReminderCatId, ReminderCatName FROM gl_remindercategory_m')

    customers_data = cur.fetchall()

    # print(projects_data)

    rows = [x for x in cur]
    columns = [col[0] for col in cur.description]

    data = [dict(zip(columns, row)) for row in rows]
       
    # to_json = json.dumps(data, indent=2)
    customers_json = json.dumps(data)

    # print(projects_json)
    print(json.loads(customers_json)[0]["ReminderCatId"])
   
    customers_json = json.loads(customers_json);

    meetings = [
        {"value": meeting["ReminderCatId"], "label": meeting["ReminderCatName"]}
        for meeting in customers_json
    ]
    return meetings, 200


if __name__ == "__main__":
    app.run(debug=True)