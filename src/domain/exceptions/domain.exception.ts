export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class InvalidTransactionException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTransactionException';
  }
}

export class TransactionNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Transaction with id "${id}" not found`);
    this.name = 'TransactionNotFoundException';
  }
}
