import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, throwError, isObservable } from 'rxjs';
import { catchError, flatMap, retry } from 'rxjs/operators';
import { Inject, InjectionToken, Injectable } from '@angular/core';
/**
 * Upper limit of retry attempts for a request with an Internal Server Error response.
 */
export const INTERNAL_SERVER_ERROR_RETRY_LIMIT = new InjectionToken<number>(
  'INTERNAL_SERVER_ERROR_RETRY_LIMIT',
  { factory: () => 3 }
);
/**
 * Retries a request up to [INTERNAL_SERVER_ERROR_RETRY_LIMIT] times
 * if the response contained an Internal Server Error with status code 500.
 * Otherwise, it forwards the response.
 */
@Injectable()
export class RetryOnInternalServerErrorInterceptor implements HttpInterceptor {
  constructor(
    @Inject(INTERNAL_SERVER_ERROR_RETRY_LIMIT)
    private readonly retryLimit: number
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: any) => {
        const error$ = throwError(error);
        if (error instanceof HttpErrorResponse && error.status === 500) {
          return error$;
        }
        return of(error$);
      }),
      retry(this.retryLimit),
      flatMap((value: any) => (isObservable(value) ? value : of(value)))
    );
  }
}
