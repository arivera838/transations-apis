import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamoDBModule } from './infrastructure/adapters/dynamodb/dynamodb.module';
import { TransactionModule } from './transaction.module';
import awsConfig from './infrastructure/config/aws.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [awsConfig],
      envFilePath: '.env',
    }),
    DynamoDBModule,
    TransactionModule,
  ],
})
export class AppModule {}
