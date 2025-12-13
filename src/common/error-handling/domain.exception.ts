import { InternalErrorCode } from './internal-error-code';

export class DomainException extends Error {
  constructor(
    public readonly errorCode: InternalErrorCode,
    public readonly message: string,
  ) {
    super(message);
    this.name = 'DomainException';
  }
}
