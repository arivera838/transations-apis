import { Body, Controller, HttpCode, Post, Logger, Headers, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ProcessWompiWebhookUseCase } from '../../application/use-cases/process-wompi-webhook.use-case';
import { WompiWebhookDto } from '../../application/dtos/wompi-webhook.dto';

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(@Inject(ProcessWompiWebhookUseCase) private readonly processWompiWebhookUseCase: ProcessWompiWebhookUseCase) { }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle Wompi transaction status updates' })
  @ApiBody({ type: WompiWebhookDto })
  @ApiResponse({ status: 200, description: 'Webhook received successfully' })
  async handleWompiWebhook(@Body() payload: WompiWebhookDto, @Headers() headers: any) {
    this.logger.log('Received webhook request');
    try {
      await this.processWompiWebhookUseCase.execute(payload);
    } catch (error) {
      this.logger.error('Failed to process webhook', error instanceof Error ? error.stack : String(error));
      // We still return 200 OK so Wompi doesn't retry endlessly, 
      // or we can let it throw if we want Wompi to retry.
      // Usually, signature verification failures should not be retried.
      if (error.message === 'Invalid signature') {
        // returning 200 for invalid signature stops attackers from guessing
        return { received: true };
      }
      throw error; // Let NestJS return 500, Wompi will retry
    }
    return { received: true };
  }
}
