const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamo = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  const orderId = event.pathParameters.orderId;

  const result = await dynamo.send(new GetItemCommand({
    TableName: "Orders",
    Key: {
      orderId: { S: orderId },
      userId:  { S: "test-user-001" }
    }
  }));

  if (!result.Item) {
    return { 
      statusCode: 404, 
      body: JSON.stringify({ message: "Order not found" }) 
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      orderId:  result.Item.orderId.S,
      product:  result.Item.product.S,
      quantity: result.Item.quantity.N,
      status:   result.Item.status.S
    })
  };
};