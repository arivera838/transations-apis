import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PRODUCT_REPOSITORY_PORT } from '../../domain/ports/product.repository.port';
import type { ProductRepositoryPort } from '../../domain/ports/product.repository.port';
import { TRANSACTION_REPOSITORY_PORT } from '../../domain/ports/transaction.repository.port';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port';
import { TransactionStatus } from '../../domain/enums/transaction-status.enum';
@Injectable()
export class ProcessWompiWebhookUseCase {
  private readonly logger = new Logger(ProcessWompiWebhookUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY_PORT)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
    private readonly configService: ConfigService,
  ) { }

  async execute(payload: any): Promise<void> {
    this.logger.log(`Received Wompi Webhook for event: ${payload.event}`);

    // Verify signature
    if (!this.verifySignature(payload)) {
      this.logger.error('Invalid Wompi Webhook signature');
      throw new Error('Invalid signature');
    }

    if (payload.event !== 'transaction.updated') {
      this.logger.log(`Ignoring event: ${payload.event}`);
      return;
    }

    const transactionData = payload.data?.transaction;
    if (!transactionData || !transactionData.id) {
      this.logger.error('Invalid payload: missing transaction data');
      throw new Error('Invalid payload');
    }

    const wompiStatus = transactionData.status; // 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'
    const paymentId = transactionData.id;

    const transaction = await this.transactionRepository.findByPaymentId(paymentId);
    if (!transaction) {
      this.logger.warn(`Transaction not found for paymentId: ${paymentId}`);
      return;
    }

    // Determine internal status based on Wompi status
    let internalStatus: TransactionStatus;
    switch (wompiStatus) {
      case 'APPROVED':
        internalStatus = TransactionStatus.APPROVED;
        break;
      case 'DECLINED':
      case 'VOIDED':
      case 'ERROR':
        internalStatus = TransactionStatus.FAILED;
        break;
      default:
        internalStatus = TransactionStatus.PENDING;
    }

    // Process logic only if status is changing
    if (transaction.status !== internalStatus) {
      // If it became COMPLETED, decrement stock
      if (internalStatus === TransactionStatus.APPROVED) {
        for (const item of transaction.items) {
          try {
            await this.productRepository.decrementStock(item.productId, item.quantity);
          } catch (error) {
            this.logger.error(`Failed to decrement stock for product ${item.productId}: ${error.message}`);
            // Note: in a real system we might need compensating transactions or a retry mechanism here
          }
        }
      }

      await this.transactionRepository.updateStatus(transaction.id, internalStatus);
      this.logger.log(`Updated transaction ${transaction.id} to status ${internalStatus}`);
    } else {
      this.logger.log(`Transaction ${transaction.id} is already in status ${internalStatus}`);
    }
  }

  private verifySignature(payload: any): boolean {
    try {
      const signature = payload.signature;
      if (!signature || !signature.properties || !signature.checksum) {
        return false;
      }

      const secret = this.configService.get<string>('WOMPI_EVENTS_SECRET');
      if (!secret) {
        this.logger.error('WOMPI_EVENTS_SECRET is not configured');
        return false;
      }

      const timestamp = payload.timestamp;
      let concatenatedValues = '';

      for (const property of signature.properties) {
        // e.g. "transaction.id" -> split by '.' and traverse payload.data
        const keys = property.split('.');
        let value: any = payload.data;
        for (const key of keys) {
          if (value === undefined) break;
          value = value[key];
        }

        if (value !== undefined) {
          concatenatedValues += String(value);
        }
      }

      concatenatedValues += String(timestamp) + secret;

      const hash = crypto.createHash('sha256').update(concatenatedValues).digest('hex');
      return hash === signature.checksum;
    } catch (err) {
      this.logger.error('Error verifying signature', err);
      return false;
    }
  }
}
