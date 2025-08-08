const errorHandler = (err, req, res, next) => {
    console.error('Error' + err);

    let error = {
        message: err.message || 'Internal Server Error',
        status: err.status || 500,
    }

    // SQLite specific errors
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    error.message = 'Resource already exists';
    error.status = 409;
  } else if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    error.message = 'Referenced resource does not exist';
    error.status = 400;
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    error.message = 'Database constraint violation';
    error.status = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.status = 401;
  } else if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.status = 401;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = 'Validation failed';
    error.status = 400;
  }

  // Send error response
  res.status(error.status).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;