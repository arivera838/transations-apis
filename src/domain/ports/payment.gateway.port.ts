import { TransactionStatus } from '../enums/transaction-status.enum';

export interface PaymentMethodData {
  type: string;
  token: string;
  customerEmail: string;
  acceptanceToken: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  status?: TransactionStatus;
  gatewayTransactionId?: string;
  error?: string;
}

export interface PaymentGatewayPort {
  processPayment(
    transactionId: string,
    amount: number,
    currency: string,
    paymentMethodData: PaymentMethodData,
  ): Promise<PaymentGatewayResponse>;
}

export const PAYMENT_GATEWAY_PORT = Symbol('PaymentGatewayPort');
