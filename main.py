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

# By Irsad  - 12-Jun-2024
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # 2MB limit =

app.config['UPLOADED_IMAGE_FOLDER'] = "uploadedfiles"
app.config['PROFILEPIC_TEMPIMAGE_FOLDER'] = "uploadedfiles/ProfilePicsTemp"
app.config['PROFILEPIC_IMAGE_FOLDER'] = "uploadedfiles/ProfilePics"

app.config["API_URL"] = "http://127.0.0.1:5000"

CORS(app)

app.config['SECRET_KEY'] = '33kuberJWT'
token_blacklist = set()
# End Irsad  Code

def encode_auth_token(user_id):
    # By Irsad  - 10-Jun-20204 (For Encoding Token)
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
    # By Irsad  - 10-Jun-20204 (For Decoding Token)
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
    # By Irsad  - 10-Jun-20204 (For Checking Token)
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
    email_server ="SMTP"    # By Irsad  - 09-May-2024 
    
    print('Send_email API Called for ' + email_server + ' Server') # By Irsad  - 09-May-2024

    # By Irsad  - 09-May-2024
   
    
    if email_server=="SMTP":
        sender_email = 'your email'
        password = 'your password'
    # End Irsad Change - 09-May-2024

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
    print('Attaching message to email') # By Irsad  - 09-May-2024
    msg.attach(MIMEText(message, 'html'))

    # Setup SMTP server
    print('Setting up SMTP Server')     # By Irsad  - 09-May-2024

    # By Irsad  - 09-May-2024
    if email_server=="gmail":
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()

    if email_server=="SMTP":
        smtp_server = 'smtpout.secureserver.net'
        smtp_port = 465  # SSL port

        server = smtplib.SMTP_SSL(smtp_server, smtp_port)
    # End Irsad Change - 09-May-2024
    
    # Log in to your email account
    print('Login to email Account') # By Irsad  - 09-May-2024
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

if __name__ == "__main__":
    app.run(debug=True)
