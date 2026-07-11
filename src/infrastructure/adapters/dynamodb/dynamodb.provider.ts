import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@nestjs/config';

export const DYNAMODB_CLIENT = Symbol('DynamoDBDocumentClient');

export const dynamoDBProviders = [
  {
    provide: DYNAMODB_CLIENT,
    useFactory: (configService: ConfigService): DynamoDBDocumentClient => {
      const client = new DynamoDBClient({
        region: configService.get<string>('aws.region'),
        credentials: {
          accessKeyId: configService.get<string>('aws.accessKeyId') ?? '',
          secretAccessKey:
            configService.get<string>('aws.secretAccessKey') ?? '',
        },
      });

      return DynamoDBDocumentClient.from(client, {
        marshallOptions: {
          removeUndefinedValues: true,
          convertEmptyValues: false,
        },
        unmarshallOptions: {
          wrapNumbers: false,
        },
      });
    },
    inject: [ConfigService],
  },
];
