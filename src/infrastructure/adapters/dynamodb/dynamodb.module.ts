import { Global, Module } from '@nestjs/common';
import { dynamoDBProviders, DYNAMODB_CLIENT } from './dynamodb.provider';

@Global()
@Module({
  providers: [...dynamoDBProviders],
  exports: [DYNAMODB_CLIENT],
})
export class DynamoDBModule {}
