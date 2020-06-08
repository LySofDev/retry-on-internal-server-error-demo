import { Injectable } from '@angular/core';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import {
  HttpClient,
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { TestBed, async, fakeAsync, inject } from '@angular/core/testing';

import { RetryOnInternalServerErrorInterceptor } from './retry-on-internal-server-error.interceptor';

@Injectable()
class MockService {
  constructor(private http: HttpClient) {}

  mockRequest(): Observable<any> {
    return this.http.get('/mock');
  }
}

describe('RetryOnInternalServerErrorInterceptor', () => {
  let testRequest: TestRequest;
  let testNext: jest.Mock;
  let testError: jest.Mock;
  let testComplete: jest.Mock;

  beforeEach(async(() => {
    testNext = jest.fn();
    testError = jest.fn();
    testComplete = jest.fn();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: RetryOnInternalServerErrorInterceptor,
          multi: true,
        },
        MockService,
      ],
    });
  }));

  beforeEach(inject(
    [MockService, HttpTestingController],
    (mockService: MockService, http: HttpTestingController) => {
      mockService.mockRequest().subscribe({
        next: testNext,
        error: testError,
        complete: testComplete,
      });
      testRequest = http.expectOne('/mock');
    }
  ));

  describe('when receiving a 200 response', () => {
    beforeEach(() => {
      testRequest.flush(null);
    });

    it('forwards the response', () => {
      expect(testNext).toHaveBeenCalledWith(null);
    });

    it('completes', () => {
      expect(testComplete).toHaveBeenCalled();
    });

    it('doesnt throw an error', () => {
      expect(testError).not.toHaveBeenCalled();
    });
  });

  describe('when receiving a 400 response', () => {
    beforeEach(() => {
      testRequest.error(new ErrorEvent('Bad Request'), {
        status: 400,
        statusText: 'Bad Request',
      });
    });

    it('doesnt forward any response', () => {
      expect(testNext).not.toHaveBeenCalled();
    });

    it('doesnt complete', () => {
      expect(testComplete).not.toHaveBeenCalled();
    });

    it('throws an error', () => {
      expect(testError).toHaveBeenCalled();
    });
  });

  describe('when receiving a 401 response', () => {
    beforeEach(() => {
      testRequest.error(new ErrorEvent('Unauthorized'), {
        status: 401,
        statusText: 'Unauthorized',
      });
    });

    it('doesnt forward any response', () => {
      expect(testNext).not.toHaveBeenCalled();
    });

    it('doesnt complete', () => {
      expect(testComplete).not.toHaveBeenCalled();
    });

    it('throws an error', () => {
      expect(testError).toHaveBeenCalled();
    });
  });

  describe('when receiving a 500 error', () => {
    beforeEach(() => {
      testRequest.error(new ErrorEvent('Internal Server Error'), {
        status: 500,
        statusText: 'Internal Server Error',
      });
    });

    it('retries the request', inject(
      [HttpTestingController],
      (http: HttpTestingController) => {
        http.expectOne('/mock');
      }
    ));

    describe('when the retry succeeds', () => {
      beforeEach(inject(
        [HttpTestingController],
        (http: HttpTestingController) => {
          testRequest = http.expectOne('/mock');
          testRequest.flush(null);
        }
      ));

      it('forwards the response', () => {
        expect(testNext).toHaveBeenCalledWith(null);
      });

      it('completes', () => {
        expect(testComplete).toHaveBeenCalled();
      });

      it('doesnt throw an error', () => {
        expect(testError).not.toHaveBeenCalled();
      });
    });

    describe('when the retry fails', () => {
      beforeEach(inject(
        [HttpTestingController],
        (http: HttpTestingController) => {
          testRequest = http.expectOne('/mock');
          testRequest.error(new ErrorEvent('Internal Server Error'), {
            status: 500,
            statusText: 'Internal Server Error',
          });
        }
      ));

      it('retries the request again', inject(
        [HttpTestingController],
        (http: HttpTestingController) => {
          http.expectOne('/mock');
        }
      ));

      describe('when the second retry succeeds', () => {
        beforeEach(inject(
          [HttpTestingController],
          (http: HttpTestingController) => {
            testRequest = http.expectOne('/mock');
            testRequest.flush(null);
          }
        ));

        it('forwards the response', () => {
          expect(testNext).toHaveBeenCalledWith(null);
        });

        it('completes', () => {
          expect(testComplete).toHaveBeenCalled();
        });

        it('doesnt throw an error', () => {
          expect(testError).not.toHaveBeenCalled();
        });
      });

      describe('when the second retry fails', () => {
        beforeEach(inject(
          [HttpTestingController],
          (http: HttpTestingController) => {
            testRequest = http.expectOne('/mock');
            testRequest.error(new ErrorEvent('Internal Server Error'), {
              status: 500,
              statusText: 'Internal Server Error',
            });
          }
        ));

        it('retries the request again', inject(
          [HttpTestingController],
          (http: HttpTestingController) => {
            http.expectOne('/mock');
          }
        ));

        describe('when the third retry succeeds', () => {
          beforeEach(inject(
            [HttpTestingController],
            (http: HttpTestingController) => {
              testRequest = http.expectOne('/mock');
              testRequest.flush(null);
            }
          ));

          it('forwards the response', () => {
            expect(testNext).toHaveBeenCalledWith(null);
          });

          it('completes', () => {
            expect(testComplete).toHaveBeenCalled();
          });

          it('doesnt throw an error', () => {
            expect(testError).not.toHaveBeenCalled();
          });
        });

        describe('when the third retry fails', () => {
          beforeEach(inject(
            [HttpTestingController],
            (http: HttpTestingController) => {
              testRequest = http.expectOne('/mock');
              testRequest.error(new ErrorEvent('Internal Server Error'), {
                status: 500,
                statusText: 'Internal Server Error',
              });
            }
          ));

          it('doesnt forward any response', () => {
            expect(testNext).not.toHaveBeenCalled();
          });

          it('doesnt complete', () => {
            expect(testComplete).not.toHaveBeenCalled();
          });

          it('throws an error', () => {
            expect(testError).toHaveBeenCalled();
          });
        });
      });
    });
  });
});
