import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamoDBModule } from './infrastructure/adapters/dynamodb/dynamodb.module';
import { TransactionModule } from './transaction.module';
import { ProductModule } from './product.module';
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
    ProductModule,
  ],
})
export class AppModule {}
