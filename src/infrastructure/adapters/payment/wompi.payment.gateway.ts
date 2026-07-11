import { Injectable, Logger } from '@nestjs/common';
import { PaymentGatewayPort, PaymentGatewayResponse, PaymentMethodData } from '../../../domain/ports/payment.gateway.port';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WompiPaymentGateway implements PaymentGatewayPort {
  private readonly logger = new Logger(WompiPaymentGateway.name);
  private readonly apiUrl: string;
  private readonly privateKey: string;
  private readonly integrityKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('WOMPI_API_URL') || 'https://api-sandbox.co.uat.wompi.dev/v1';
    this.privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY') || 'prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg';
    this.integrityKey = this.configService.get<string>('WOMPI_INTEGRITY_KEY') || 'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp';
  }

  async processPayment(
    transactionId: string,
    amount: number,
    currency: string,
    paymentMethodData: PaymentMethodData,
  ): Promise<PaymentGatewayResponse> {
    try {
      const amountInCents = Math.round(amount * 100);
      const reference = transactionId;
      
      // Calculate integrity signature
      const signatureString = `${reference}${amountInCents}${currency}${this.integrityKey}`;
      const hash = crypto.createHash('sha256').update(signatureString).digest('hex');

      const payload = {
        acceptance_token: paymentMethodData.acceptanceToken,
        amount_in_cents: amountInCents,
        currency: currency,
        signature: hash,
        customer_email: paymentMethodData.customerEmail,
        payment_method: {
          type: paymentMethodData.type,
          token: paymentMethodData.token,
          installments: 1, // Defaulting to 1 for cards
        },
        reference: reference,
      };

      const response = await fetch(`${this.apiUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.privateKey}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        this.logger.error(`Wompi payment failed for ${transactionId}: ${JSON.stringify(responseData)}`);
        return {
          success: false,
          error: responseData.error?.messages?.join(', ') || 'Payment failed at gateway',
        };
      }

      const wompiTransactionId = responseData.data?.id;
      const status = responseData.data?.status;

      // In sandbox it may be APPROVED, DECLINED, VOIDED, ERROR
      if (status === 'APPROVED') {
        return {
          success: true,
          gatewayTransactionId: wompiTransactionId,
        };
      } else {
        return {
          success: false,
          gatewayTransactionId: wompiTransactionId,
          error: `Payment status: ${status}`,
        };
      }
    } catch (error) {
      this.logger.error(`Wompi payment error for ${transactionId}`, error instanceof Error ? error.stack : String(error));
      return {
        success: false,
        error: 'Internal error communicating with payment gateway',
      };
    }
  }
}
