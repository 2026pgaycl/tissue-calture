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
    const bodyObj =
      typeof body === "object" && body !== null ? (body as Record<string, unknown>) : null;

    const rawMessage = typeof body === "string" ? body : (bodyObj?.message ?? "Internal server error");
    const message = Array.isArray(rawMessage) ? "Validation failed" : (rawMessage as string);

    // class-validator puts field errors in `message` as a string[]; custom exceptions (e.g.
    // BadRequestException({ message, insufficient: [...] })) put structured data in other
    // top-level fields. Surface both as `details` rather than silently dropping either.
    const { message: _m, statusCode: _s, error: _e, ...rest } = bodyObj ?? {};
    const details = Array.isArray(rawMessage)
      ? rawMessage
      : Object.keys(rest).length > 0
        ? rest
        : undefined;

    response.status(status).json({
      error: {
        code: HttpStatus[status] ?? "INTERNAL_SERVER_ERROR",
        message,
        ...(details ? { details } : {}),
      },
    });
  }
}
