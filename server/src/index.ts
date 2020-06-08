import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const RANDOM_INTERNAL_SERVER_ERROR_CHANCE: number = 10;

const PORT = 3000;

const LOGIN_ROUTE = '/login';

enum ErrorMessage {
  RANDOM_ERROR = 'We dont know what happened',
  INVALID_EMAIL = 'This email is not valid',
  INVALID_PASSWORD = 'This password is not valid',
  FAILED_AUTHENTICATION = 'An account was not found for this email and password',
}

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
  if (password !== 'password') {
    return {
      hasError: true,
      errorMessage: ErrorMessage.FAILED_AUTHENTICATION,
    };
  }
  return {
    hasError: false,
  };
}

const app = express();

app.use(cors());

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

app.listen(PORT, () => console.log(`Listening on port ${PORT}.`));
