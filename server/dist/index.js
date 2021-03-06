"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var body_parser_1 = __importDefault(require("body-parser"));
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
var RANDOM_INTERNAL_SERVER_ERROR_CHANCE = 10;
/**
 * The password to authenticate the user's
 * credentials with.
 */
var PASSWORD_PRESET = 'password';
/**
 * The port the server will listen on.
 */
var PORT = 3000;
/**
 * The route for the authentication request.
 */
var LOGIN_ROUTE = '/login';
/**
 * Possible Error Messages
 */
var ErrorMessage;
(function (ErrorMessage) {
    ErrorMessage["RANDOM_ERROR"] = "We dont know what happened";
    ErrorMessage["INVALID_EMAIL"] = "This email is not valid";
    ErrorMessage["INVALID_PASSWORD"] = "This password is not valid";
    ErrorMessage["FAILED_AUTHENTICATION"] = "An account was not found for this email and password";
})(ErrorMessage || (ErrorMessage = {}));
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
function authenticate(email, password) {
    if (RANDOM_INTERNAL_SERVER_ERROR_CHANCE === 1) {
        return {
            hasError: true,
            errorMessage: ErrorMessage.RANDOM_ERROR,
        };
    }
    if (RANDOM_INTERNAL_SERVER_ERROR_CHANCE > 0 &&
        Math.floor(Math.random() * RANDOM_INTERNAL_SERVER_ERROR_CHANCE) + 1 === 1) {
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
var app = express_1.default();
/**
 * Allow Cross Origin Requests
 */
app.use(cors_1.default());
/**
 * Handles the authentication requests via
 * a POST request to the [LOGIN_ROUTE]. It
 * then calls the authenticate method and
 * tests for errors. If no errors are found,
 * it returns a 200 response. Otherwise, it
 * forwards the error to the next handler.
 */
app.post(LOGIN_ROUTE, body_parser_1.default.json(), function (request, response, next) {
    var _a = request.body, _b = _a.email, email = _b === void 0 ? '' : _b, _c = _a.password, password = _c === void 0 ? '' : _c;
    var _d = authenticate(email, password), hasError = _d.hasError, error = _d.errorMessage;
    if (hasError) {
        next(new Error(error));
    }
    else {
        response.json(null);
    }
});
/**
 * This error handler will filter
 * for authentication errors, attach
 * the correct status code to the response
 * and serve the error messages as part
 * of the response body.
 */
app.use(function (error, _request, response, _next) {
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
});
/**
 * Initiate the app on the given [PORT].
 */
app.listen(PORT, function () { return console.log("Listening on port " + PORT + "."); });
