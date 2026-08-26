import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Response } from "express";

/** Maps every thrown error to the API's `{ error: { code, message, details? } }` envelope. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : null;

    const rawMessage =
      typeof body === "string"
        ? body
        : ((body as { message?: string | string[] } | null)?.message ?? "Internal server error");
    const details = Array.isArray(rawMessage) ? rawMessage : undefined;
    const message = Array.isArray(rawMessage) ? "Validation failed" : rawMessage;

    response.status(status).json({
      error: {
        code: HttpStatus[status] ?? "INTERNAL_SERVER_ERROR",
        message,
        ...(details ? { details } : {}),
      },
    });
  }
}
