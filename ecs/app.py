from flask import Flask, request, jsonify
import boto3
import time
import os

app = Flask(__name__)

dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
table = dynamodb.Table('lambda-apigateway')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'ecs-fargate-api'})

@app.route('/DynamoDBManager', methods=['POST'])
def dynamo_handler():
    start = time.time()
    data = request.get_json()

    operation = data.get('operation')
    payload = data.get('payload', {})

    operations = {
        'create': lambda: table.put_item(**payload),
        'read':   lambda: table.get_item(**payload),
        'update': lambda: table.update_item(**payload),
        'delete': lambda: table.delete_item(**payload),
        'list':   lambda: table.scan(**payload),
        'echo':   lambda: payload,
        'ping':   lambda: 'pong'
    }

    if operation not in operations:
        return jsonify({'error': f'Unrecognized operation "{operation}"'}), 400

    result = operations[operation]()
    duration_ms = round((time.time() - start) * 1000, 2)

    # Convert DynamoDB response for JSON serialization
    if hasattr(result, 'get'):
        result = {k: v for k, v in result.items() if k != 'ResponseMetadata'}

    return jsonify({
        'result': result,
        'duration_ms': duration_ms,
        'compute': 'ecs-fargate'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)