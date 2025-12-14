import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@common/logger/logger';
import { DomainException } from './domain.exception';
import { InternalErrorCode } from './internal-error-code';

export interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
  path: string;
}

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let errorResponse: ErrorResponse;

    if (exception instanceof DomainException) {
      errorResponse = this.handleDomainException(exception, request);
    } else if (exception instanceof HttpException) {
      errorResponse = this.handleHttpException(exception, request);
    } else {
      errorResponse = this.handleGenericError(exception, request);
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private handleDomainException(
    exception: DomainException,
    request: Request,
  ): ErrorResponse {
    const statusCode = this.mapErrorCodeToHttpStatus(exception.errorCode);

    this.logger.warn(
      `DomainException: ${exception.errorCode} - ${exception.message} at ${request.method} ${request.url}`,
    );

    return {
      statusCode,
      code: exception.errorCode,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }

  private handleHttpException(
    exception: HttpException,
    request: Request,
  ): ErrorResponse {
    const status = exception.getStatus();
    const responseData = exception.getResponse();

    let message = 'HTTP Exception';
    if (typeof responseData === 'string') {
      message = responseData;
    } else if (
      typeof responseData === 'object' &&
      (responseData as any).message
    ) {
      message = (responseData as any).message;
    }

    this.logger.warn(
      `HttpException (status: ${status} at ${request.method} ${request.url}): ${message}`,
    );

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error('HttpException stack:', exception.stack);
    }

    // Map HTTP status to error code
    let errorCode: InternalErrorCode;
    if (status === HttpStatus.NOT_FOUND) {
      errorCode = InternalErrorCode.NOT_FOUND;
    } else if (status === HttpStatus.BAD_REQUEST) {
      errorCode = InternalErrorCode.VALIDATION_ERROR;
    } else if (status === HttpStatus.UNAUTHORIZED) {
      errorCode = InternalErrorCode.UNAUTHORIZED;
    } else if (status === HttpStatus.FORBIDDEN) {
      errorCode = InternalErrorCode.FORBIDDEN;
    } else if (status === HttpStatus.CONFLICT) {
      errorCode = InternalErrorCode.USER_ALREADY_EXISTS;
    } else {
      errorCode = InternalErrorCode.INTERNAL_SERVER_ERROR;
    }

    return {
      statusCode: status,
      code: errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }

  private handleGenericError(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    const errorMessage =
      exception instanceof Error
        ? exception.stack || exception.message
        : String(exception);

    this.logger.error(
      `Unexpected error at ${request.method} ${request.url}:`,
      errorMessage,
    );

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: InternalErrorCode.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }

  private mapErrorCodeToHttpStatus(errorCode: InternalErrorCode): number {
    const mapping: Record<InternalErrorCode, number> = {
      [InternalErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
      [InternalErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
      [InternalErrorCode.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
      [InternalErrorCode.FORBIDDEN]: HttpStatus.FORBIDDEN,
      [InternalErrorCode.INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
      [InternalErrorCode.USER_ALREADY_EXISTS]: HttpStatus.CONFLICT,
      [InternalErrorCode.INTERNAL_SERVER_ERROR]:
        HttpStatus.INTERNAL_SERVER_ERROR,
    };

    return mapping[errorCode] || HttpStatus.BAD_REQUEST;
  }
}
