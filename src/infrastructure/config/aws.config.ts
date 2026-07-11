import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
  accessKeyId: process.env['AWS_ACCESS_KEY_ID'] ?? '',
  secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
  region: process.env['AWS_REGION'] ?? 'us-east-1',
  dynamodb: {
    transactionsTable:
      process.env['DYNAMODB_TABLE_TRANSACTIONS'] ?? 'Transactions',
    productsTable:
      process.env['DYNAMODB_TABLE_PRODUCTS'] ?? 'Products',
  },
}));
