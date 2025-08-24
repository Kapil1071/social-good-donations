import os
import json
import razorpay

def handler(event, context):
    try:
        body = json.loads(event['body'])
        amount = int(body['amount'])

        client = razorpay.Client(
            auth=(os.environ.get('RAZORPAY_KEY_ID'), os.environ.get('RAZORPAY_KEY_SECRET'))
        )
        
        order_data = {
            'amount': amount,
            'currency': 'INR',
            'payment_capture': '1' 
        }

        order = client.order.create(data=order_data)
        
        return {
            'statusCode': 200,
            'body': json.dumps(order)
        }
    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}