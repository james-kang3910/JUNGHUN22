const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}] ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Determine log level from environment
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create transports
const transports = [
  // Console output (always enabled)
  new winston.transports.Console({
    format: NODE_ENV === 'production' ? logFormat : consoleFormat,
    level: LOG_LEVEL
  })
];

// Add file logging in production
if (NODE_ENV === 'production' && process.env.LOG_FILE) {
  const logDir = path.dirname(process.env.LOG_FILE);
  
  // Combined log (all levels)
  transports.push(
    new winston.transports.File({
      filename: process.env.LOG_FILE,
      format: logFormat,
      level: 'info',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );
  
  // Error log (errors only)
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      format: logFormat,
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  transports,
  exitOnError: false
});

// Add request logging middleware
logger.requestLogger = () => {
  return (req, res, next) => {
    const start = Date.now();
    
    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent')
      });
    });
    
    next();
  };
};

// Add error logging middleware
logger.errorLogger = () => {
  return (err, req, res, next) => {
    logger.error('Error occurred', {
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress
    });
    next(err);
  };
};

module.exports = logger;
