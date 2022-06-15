class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    this.isOperational = true; //to know if the error is operational or not - programming etc errors cannot be handled

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
