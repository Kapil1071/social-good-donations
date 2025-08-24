import os
import json
import razorpay

def handler(event, context):
    try:
        body = json.loads(event['body'])
        
        client = razorpay.Client(
            auth=(os.environ.get('RAZORPAY_KEY_ID'), os.environ.get('RAZORPAY_KEY_SECRET'))
        )

        client.utility.verify_payment_signature({
            'razorpay_order_id': body['razorpay_order_id'],
            'razorpay_payment_id': body['razorpay_payment_id'],
            'razorpay_signature': body['razorpay_signature']
        })
        
        # If verification is successful, it will not raise an exception
        return {'statusCode': 200, 'body': json.dumps({'status': 'verified'})}

    except Exception as e:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Payment verification failed'})}
