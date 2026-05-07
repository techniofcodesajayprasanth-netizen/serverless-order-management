const { DynamoDBClient, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const dynamo = new DynamoDBClient({ region: "us-east-1" });
const sns    = new SNSClient({ region: "us-east-1" });

exports.handler = async (event) => {
  for (const record of event.Records) {
    const { orderId, userId } = JSON.parse(record.body);

    await dynamo.send(new UpdateItemCommand({
      TableName: "Orders",
      Key: {
        orderId: { S: orderId },
        userId:  { S: userId }
      },
      UpdateExpression: "SET #s = :status",
      ExpressionAttributeNames:  { "#s": "status" },
      ExpressionAttributeValues: { ":status": { S: "CONFIRMED" } }
    }));

    await sns.send(new PublishCommand({
      TopicArn: process.env.ORDER_TOPIC_ARN,
      Subject:  "Order Confirmed",
      Message:  `Your order ${orderId} is confirmed.`
    }));
  }
  return { statusCode: 200 };
};