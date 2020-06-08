"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var body_parser_1 = __importDefault(require("body-parser"));
var RANDOM_INTERNAL_SERVER_ERROR_CHANCE = 10;
var PORT = 3000;
var LOGIN_ROUTE = '/login';
var ErrorMessage;
(function (ErrorMessage) {
    ErrorMessage["RANDOM_ERROR"] = "We dont know what happened";
    ErrorMessage["INVALID_EMAIL"] = "This email is not valid";
    ErrorMessage["INVALID_PASSWORD"] = "This password is not valid";
    ErrorMessage["FAILED_AUTHENTICATION"] = "An account was not found for this email and password";
})(ErrorMessage || (ErrorMessage = {}));
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
var app = express_1.default();
app.use(cors_1.default());
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
app.listen(PORT, function () { return console.log("Listening on port " + PORT + "."); });
