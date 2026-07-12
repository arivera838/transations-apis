import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@nestjs/config';

export const DYNAMODB_CLIENT = Symbol('DynamoDBDocumentClient');

export const dynamoDBProviders = [
  {
    provide: DYNAMODB_CLIENT,
    useFactory: (configService: ConfigService): DynamoDBDocumentClient => {
      const region = configService.get<string>('aws.region');
      const accessKeyId = configService.get<string>('aws.accessKeyId');
      const secretAccessKey = configService.get<string>('aws.secretAccessKey');

      const config: any = { region };

      if (accessKeyId && secretAccessKey) {
        config.credentials = {
          accessKeyId,
          secretAccessKey,
        };
      }

      const client = new DynamoDBClient(config);

      return DynamoDBDocumentClient.from(client, {
        marshallOptions: {
          removeUndefinedValues: true,
          convertEmptyValues: false,
          convertClassInstanceToMap: true,
        },
        unmarshallOptions: {
          wrapNumbers: false,
        },
      });
    },
    inject: [ConfigService],
  },
];
