import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
/**
 * The value of [n] for a one in [n] chance
 * of a random Internal Server Error ocurring
 * when handling a request.
 *
 * Ex.
 *```
 * n  | Random Error Chance
 * ------------------------
 * 0  | 0%
 * 1  | 100%
 * 2  | 50%
 * 4  | 25%
 * 5  | 20%
 * 10 | 10%
 * ```
 */
const RANDOM_INTERNAL_SERVER_ERROR_CHANCE: number = 10;
/**
 * The password to authenticate the user's
 * credentials with.
 */
const PASSWORD_PRESET: string = 'password';
/**
 * The port the server will listen on.
 */
const PORT = 3000;
/**
 * The route for the authentication request.
 */
const LOGIN_ROUTE = '/login';
/**
 * Possible Error Messages
 */
enum ErrorMessage {
  RANDOM_ERROR = 'We dont know what happened',
  INVALID_EMAIL = 'This email is not valid',
  INVALID_PASSWORD = 'This password is not valid',
  FAILED_AUTHENTICATION = 'An account was not found for this email and password',
}
/**
 * Authenticate a user based on a set of [email]
 * and [password] credentials. The authentication
 * attempt may randomly fail based on the chance of
 * random error.
 *
 * It may also fail the validation of either
 * the [email] or [password] based on the following
 * criteria:
 * - [email] must match the email regular expression.
 * - [password] must be at least 8 characters long.
 *
 * Given that the credentials are valid, it will
 * compare the password to a preset to mimic the
 * actual authentication process. It will return
 * an error if the password doesn't match the preset.
 *
 * @param email The user's unique email.
 * @param password The user's password.
 * @returns [hasError] will be true if an error was
 * encountered during authentication and include
 * the [errorMessage].
 */
function authenticate(
  email: string,
  password: string
): { hasError: boolean; errorMessage?: ErrorMessage } {
  if (RANDOM_INTERNAL_SERVER_ERROR_CHANCE === 1) {
    return {
      hasError: true,
      errorMessage: ErrorMessage.RANDOM_ERROR,
    };
  }
  if (
    RANDOM_INTERNAL_SERVER_ERROR_CHANCE > 0 &&
    Math.floor(Math.random() * RANDOM_INTERNAL_SERVER_ERROR_CHANCE) + 1 === 1
  ) {
    return {
      hasError: true,
      errorMessage: ErrorMessage.RANDOM_ERROR,
    };
  }
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return {
      hasError: true,
      errorMessage: ErrorMessage.INVALID_EMAIL,
    };
  }
  if (password.length < 8) {
    return {
      hasError: true,
      errorMessage: ErrorMessage.INVALID_PASSWORD,
    };
  }
  if (password !== PASSWORD_PRESET) {
    return {
      hasError: true,
      errorMessage: ErrorMessage.FAILED_AUTHENTICATION,
    };
  }
  return {
    hasError: false,
  };
}
/**
 * The Mock Authentication Service application.
 */
const app = express();
/**
 * Allow Cross Origin Requests
 */
app.use(cors());
/**
 * Handles the authentication requests via
 * a POST request to the [LOGIN_ROUTE]. It
 * then calls the authenticate method and
 * tests for errors. If no errors are found,
 * it returns a 200 response. Otherwise, it
 * forwards the error to the next handler.
 */
app.post(
  LOGIN_ROUTE,
  bodyParser.json(),
  (request: Request, response: Response, next: NextFunction) => {
    const { email = '', password = '' } = request.body;
    const { hasError, errorMessage: error } = authenticate(email, password);
    if (hasError) {
      next(new Error(error));
    } else {
      response.json(null);
    }
  }
);
/**
 * This error handler will filter
 * for authentication errors, attach
 * the correct status code to the response
 * and serve the error messages as part
 * of the response body.
 */
app.use(
  (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction
  ) => {
    console.log('Received error', error);
    if (error.message === ErrorMessage.RANDOM_ERROR) {
      response.status(500);
    }
    if (error.message === ErrorMessage.INVALID_PASSWORD) {
      response.status(400);
    }
    if (error.message === ErrorMessage.INVALID_EMAIL) {
      response.status(400);
    }
    if (error.message === ErrorMessage.FAILED_AUTHENTICATION) {
      response.status(401);
    }
    response.json(error);
  }
);
/**
 * Initiate the app on the given [PORT].
 */
app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));
