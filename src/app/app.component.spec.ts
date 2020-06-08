import {
  ComponentFixture,
  async,
  TestBed,
  inject,
} from '@angular/core/testing';
import {
  HttpClientTestingModule,
  TestRequest,
  HttpTestingController,
} from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppComponent } from './app.component';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        HttpClientTestingModule,
      ],
      declarations: [AppComponent],
    });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  }));

  it('can be created', () => {
    expect(component).toBeDefined();
    expect(component).not.toBeNull();
  });

  describe('when rendering for the first time', () => {
    beforeEach(async(() => {
      component.ngOnInit();
    }));

    it('is not loading', () => {
      expect(component.isLoading).toBeFalsy();
    });

    it('is not logged in', () => {
      expect(component.isLoggedIn).toBeFalsy();
    });

    it('doesnt have an error', () => {
      expect(component.hasError).toBeFalsy();
      expect(component.errorMessage).toBeNull();
    });

    it('has an empty email form field', () => {
      expect(component.email).toBeInstanceOf(FormControl);
      expect(component.email.value.length).toBe(0);
    });

    it('has an empty password form field', () => {
      expect(component.password).toBeInstanceOf(FormControl);
      expect(component.password.value.length).toBe(0);
    });

    describe('when filling in the email field', () => {
      describe('with an empty value', () => {
        it('will mark the email field as invalid', () => {
          component.email.setValue('');
          expect(component.email.invalid).toBeTruthy();
        });
      });

      describe('with an invalid email', () => {
        it('will mark the email field as invalid', () => {
          component.email.setValue('invalid_email');
          expect(component.email.invalid).toBeTruthy();
        });
      });

      describe('with a valid email', () => {
        it('will mark the email field as valid', () => {
          component.email.setValue('test.user@gmail.com');
          expect(component.email.valid).toBeTruthy();
        });
      });
    });

    describe('when filling in the password field', () => {
      describe('with an empty value', () => {
        it('will mark the password field as invalid', () => {
          component.password.setValue('');
          expect(component.password.invalid).toBeTruthy();
        });
      });

      describe('with an invalid password', () => {
        it('will mark the password field as invalid', () => {
          component.password.setValue('abc123');
          expect(component.password.invalid).toBeTruthy();
        });
      });

      describe('with a valid password', () => {
        it('will mark the password field as valid', () => {
          component.password.setValue('password');
          expect(component.password.valid).toBeTruthy();
        });
      });
    });

    describe('when the form has not been filled in', () => {
      it('will not be valid', () => {
        expect(component.formGroup.invalid).toBeTruthy();
      });
    });

    describe('when the form has been filled in', () => {
      beforeEach(() => {
        component.email.setValue('test.user@gmail.com');
        component.password.setValue('password');
      });

      describe('with an invalid email', () => {
        it('will be invalid', () => {
          component.email.setValue('invalid_email');
          expect(component.formGroup.invalid).toBeTruthy();
        });
      });

      describe('with an invalid password', () => {
        it('will be invalid', () => {
          component.password.setValue('abc123');
          expect(component.formGroup.invalid).toBeTruthy();
        });
      });

      describe('with valid credentials', () => {
        it('will be valid', () => {
          expect(component.formGroup.valid).toBeTruthy();
        });
      });

      describe('when submitting the credentials', () => {
        let testRequest: TestRequest;

        beforeEach(inject(
          [HttpTestingController],
          (http: HttpTestingController) => {
            component.login();
            testRequest = http.expectOne('http://localhost:3000/login');
          }
        ));

        it('starts loading', () => {
          expect(component.isLoading).toBeTruthy();
        });

        it('submits the form credentials', () => {
          expect(testRequest.request.body).toEqual({
            email: 'test.user@gmail.com',
            password: 'password',
          });
        });

        describe('and the authentication succeeds', () => {
          beforeEach(() => {
            testRequest.flush(null);
          });

          it('stops loading', () => {
            expect(component.isLoading).toBeFalsy();
          });

          it('is logged in', () => {
            expect(component.isLoggedIn).toBeTruthy();
          });

          it('doesnt have errors', () => {
            expect(component.hasError).toBeFalsy();
            expect(component.errorMessage).toBeNull();
          });

          it('resets the form', () => {
            expect(component.formGroup.pristine).toBeTruthy();
          });

          describe('when logging out', () => {
            beforeEach(() => {
              component.logout();
            });

            it('is not logged in', () => {
              expect(component.isLoggedIn).toBeFalsy();
            });
          });
        });

        describe('and the authentication fails', () => {
          beforeEach(() => {
            testRequest.error(
              (new HttpErrorResponse({
                status: 401,
                statusText: 'Unauthorized',
              }) as unknown) as ErrorEvent
            );
          });

          it('stops loading', () => {
            expect(component.isLoading).toBeFalsy();
          });

          it('is not logged in', () => {
            expect(component.isLoggedIn).toBeFalsy();
          });

          it('has an error', () => {
            expect(component.hasError).toBeTruthy();
            expect(component.errorMessage).toEqual('Account was not found');
          });

          it('resets the form', () => {
            expect(component.formGroup.pristine).toBeTruthy();
          });
        });
      });
    });
  });
});
