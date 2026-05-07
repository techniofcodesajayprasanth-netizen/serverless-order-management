const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const { v4: uuidv4 } = require("uuid");

const dynamo = new DynamoDBClient({ region: "us-east-1" });
const sqs    = new SQSClient({ region: "us-east-1" });

exports.handler = async (event) => {
  const body    = JSON.parse(event.body);
  const orderId = uuidv4();
  const userId  = "test-user-001";

  await dynamo.send(new PutItemCommand({
    TableName: "Orders",
    Item: {
      orderId:  { S: orderId },
      userId:   { S: userId },
      product:  { S: body.product },
      quantity: { N: String(body.quantity) },
      status:   { S: "PENDING" },
      createdAt:{ S: new Date().toISOString() }
    }
  }));

  await sqs.send(new SendMessageCommand({
    QueueUrl:    process.env.ORDER_QUEUE_URL,
    MessageBody: JSON.stringify({ orderId, userId, product: body.product })
  }));

  return {
    statusCode: 201,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, message: "Order placed!" })
  };
}; 