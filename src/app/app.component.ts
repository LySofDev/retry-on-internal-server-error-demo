import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(
    private readonly http: HttpClient,
    private readonly snackBar: MatSnackBar
  ) {}
  /**
   * The application's title.
   */
  title = 'Demo: Retry on Internal Server Error';
  /**
   * True when the application is loading.
   */
  isLoading: boolean;
  /**
   * True when the user is authenticated.
   */
  isLoggedIn: boolean;
  /**
   * True when the authentication service
   * has returned an error.
   */
  hasError: boolean;
  /**
   * The error message returned by the
   * authentication service.
   */
  errorMessage: string;
  /**
   * The login form group.
   */
  formGroup: FormGroup;
  /**
   * The email form control.
   */
  get email(): FormControl {
    return this.formGroup.get('email') as FormControl;
  }
  /**
   * The password form control.
   */
  get password(): FormControl {
    return this.formGroup.get('password') as FormControl;
  }
  /**
   * Initialize the template state
   * and build the login form.
   */
  ngOnInit(): void {
    this.isLoading = false;
    this.isLoggedIn = false;
    this.hasError = false;
    this.errorMessage = null;
    this.formGroup = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
    });
  }
  /**
   * Authenticate the user through
   * the authentication service using the
   * current state of the login form as
   * the user's credentials.
   */
  login(): void {
    this.isLoading = true;
    this.http
      .post<any>('http://localhost:3000/login', this.formGroup.value)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.formGroup.reset();
        })
      )
      .subscribe({
        next: this.onAuthenticationSuccess.bind(this),
        error: this.onAuthenticationError.bind(this),
      });
  }
  /**
   * Revoke the user's existing
   * authentication.
   */
  logout(): void {
    this.isLoggedIn = false;
  }
  /**
   * Called asynchronously when the user's authentication
   * attempt succeeds.
   *
   * It will set the user's authenticated state
   * to true and remove any pending error
   * messages.
   */
  private onAuthenticationSuccess(): void {
    this.isLoggedIn = true;
    this.hasError = false;
    this.errorMessage = null;
  }
  /**
   * Called asynchronously when the users' authentication
   * attempt fails.
   *
   * It will show a notification with the status text of
   * the response and set an error message to be displayed
   * under the form.
   *
   * @param error An HTTP Response error with failure details.
   */
  private onAuthenticationError(error: HttpErrorResponse): void {
    this.snackBar.open(error.statusText, 'Dismiss');
    this.hasError = true;
    this.errorMessage = 'Account was not found';
  }
}
