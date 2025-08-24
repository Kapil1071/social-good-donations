
#### **`netlify/functions/send-thank-you/send-thank-you.py`**

import os
import json
import google.generativeai as genai
# Note: You'll need an email service provider like SendGrid.
# For simplicity, this code generates the email content.
# You would add the email sending logic here.

def handler(event, context):
    try:
        body = json.loads(event['body'])
        donor_name = body['name']
        donor_email = body['email']
        amount_inr = int(body['amount']) / 100

        # Configure Gemini API
        genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
        model = genai.GenerativeModel('gemini-1.5-flash-latest')

        prompt = f"""
        You are an AI for a social good charity. A donor named {donor_name} has just generously donated ₹{amount_inr}.
        Your task is to generate a short, heartfelt, and personalized thank-you email.
        
        The email should:
        1.  Address the donor by name ({donor_name}).
        2.  Express sincere gratitude for their specific donation amount (₹{amount_inr}).
        3.  Create a tangible and inspiring summary of the impact their donation could make. Be creative and specific. For example, 'Your donation could provide...'
        4.  Keep the tone warm, personal, and uplifting.
        
        Generate only the body of the email.
        """
        
        response = model.generate_content(prompt)
        email_body = response.text

        # --- Email Sending Logic Would Go Here ---
        # Example using SendGrid (you would need to `pip install sendgrid` and configure it)
        # from sendgrid import SendGridAPIClient
        # from sendgrid.helpers.mail import Mail
        # message = Mail(...)
        # sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        # response = sg.send(message)
        # ----------------------------------------
        
        print(f"Email for {donor_email}: \n{email_body}") # For logging on Netlify

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Thank you email content generated successfully.'})
        }
    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}