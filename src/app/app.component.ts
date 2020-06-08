import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, Form } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  title = 'retry-on-error-demo';

  isLoading: boolean;

  isLoggedIn: boolean;

  hasError: boolean;

  errorMessage: string;

  email: FormControl;

  password: FormControl;

  formGroup: FormGroup;

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
    this.email = this.formGroup.get('email') as FormControl;
    this.password = this.formGroup.get('password') as FormControl;
  }

  login(): void {
    this.isLoading = true;
    this.authenticate();
  }

  logout(): void {
    this.formGroup.reset();
    this.isLoggedIn = false;
  }

  private authenticate(): void {
    this.http
      .post<any>('http://localhost:3000/login', this.formGroup.value)
      .subscribe({
        next: this.onAuthenticationSuccess.bind(this),
        error: this.onAuthenticationError.bind(this),
      });
  }

  private onAuthenticationSuccess(): void {
    this.isLoading = false;
    this.isLoggedIn = true;
    this.hasError = false;
    this.errorMessage = null;
  }

  private onAuthenticationError(error: HttpErrorResponse): void {
    this.snackBar.open(error.statusText, 'Dismiss');
    this.isLoading = false;
    this.hasError = true;
    this.errorMessage = 'Account was not found';
    this.formGroup.reset();
  }
}
