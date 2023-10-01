import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
    region: 'us-east-1'
});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        const {patientId, transcription} = JSON.parse(event.body);
        const command = new PutCommand({
            TableName: "health-lens-results",
            Item: {
                patientId,
                type: 'raw',
                conversation: transcription
            },
          });
          const response = await docClient.send(command);
          console.log(response);
          return response;
    } catch (error) {
      console.error('Error occured', error);
      return {
        error
      }
    }  
  };