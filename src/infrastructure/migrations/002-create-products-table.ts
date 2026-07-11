import {
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand,
  CreateTableCommandInput,
} from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';

dotenv.config();

const TABLE_NAME =
  process.env['DYNAMODB_TABLE_PRODUCTS'] ?? 'Products';

const client = new DynamoDBClient({
  region: process.env['AWS_REGION'] ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env['AWS_ACCESS_KEY_ID'] ?? '',
    secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
  },
});

export async function createProductsTable(): Promise<void> {
  console.log(`🔍 Checking if table "${TABLE_NAME}" already exists...`);

  const listCommand = new ListTablesCommand({});
  const { TableNames } = await client.send(listCommand);

  if (TableNames?.includes(TABLE_NAME)) {
    console.log(`✅ Table "${TABLE_NAME}" already exists. Skipping creation.`);
    return;
  }

  const params: CreateTableCommandInput = {
    TableName: TABLE_NAME,
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
    ],
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    BillingMode: 'PAY_PER_REQUEST',
  };

  console.log(`🚀 Creating table "${TABLE_NAME}"...`);

  const createCommand = new CreateTableCommand(params);
  const result = await client.send(createCommand);

  console.log(
    `✅ Table "${result.TableDescription?.TableName}" created successfully!`,
  );
  console.log(`   Status: ${result.TableDescription?.TableStatus}`);
  console.log(`   ARN: ${result.TableDescription?.TableArn}`);
}
