import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { ProcessWompiWebhookUseCase } from '../../application/use-cases/process-wompi-webhook.use-case';

describe('WebhookController', () => {
  let controller: WebhookController;
  let useCase: jest.Mocked<ProcessWompiWebhookUseCase>;

  beforeEach(async () => {
    const useCaseMock = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: ProcessWompiWebhookUseCase,
          useValue: useCaseMock,
        },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
    useCase = module.get(ProcessWompiWebhookUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call execute on ProcessWompiWebhookUseCase and return { received: true }', async () => {
    const payload = { event: 'transaction.updated' };
    const headers = { 'x-wompi-signature': 'test' };

    const result = await controller.handleWompiWebhook(payload, headers);

    expect(useCase.execute).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ received: true });
  });

  it('should return { received: true } if ProcessWompiWebhookUseCase throws "Invalid signature"', async () => {
    const payload = { event: 'transaction.updated' };
    const headers = { 'x-wompi-signature': 'test' };

    useCase.execute.mockRejectedValue(new Error('Invalid signature'));

    const result = await controller.handleWompiWebhook(payload, headers);

    expect(useCase.execute).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ received: true }); // It handles the invalid signature gracefully
  });

  it('should throw the error if ProcessWompiWebhookUseCase throws something other than "Invalid signature"', async () => {
    const payload = { event: 'transaction.updated' };
    const headers = { 'x-wompi-signature': 'test' };

    const dbError = new Error('Database connection failed');
    useCase.execute.mockRejectedValue(dbError);

    await expect(controller.handleWompiWebhook(payload, headers)).rejects.toThrow('Database connection failed');
    expect(useCase.execute).toHaveBeenCalledWith(payload);
  });
});
