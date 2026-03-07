import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      let code = 'HTTP_EXCEPTION';
      let message = '요청 처리 중 오류가 발생했습니다.';

      if (typeof payload === 'string') {
        message = payload;
      } else if (payload && typeof payload === 'object') {
        const value = payload as {
          code?: unknown;
          error?: unknown;
          message?: unknown;
        };

        if (typeof value.code === 'string') {
          code = value.code;
        } else if (typeof value.error === 'string') {
          code = value.error.toUpperCase().replace(/\s+/g, '_');
        }

        if (Array.isArray(value.message)) {
          message = value.message.join(', ');
        } else if (typeof value.message === 'string') {
          message = value.message;
        }
      }

      response.status(status).json({
        success: false,
        error: {
          code,
          message,
        },
      });
      return;
    }

    response.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '서버 내부 오류가 발생했습니다.',
      },
    });
  }
}
