const config = require('../config');

class Logger {
  static log(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

    if (args.length > 0) {
      console.log(formattedMessage, ...args);
    } else {
      console.log(formattedMessage);
    }
  }

  static info(message, ...args) {
    this.log('info', message, ...args);
  }

  static warn(message, ...args) {
    this.log('warn', message, ...args);
  }

  static error(message, ...args) {
    this.log('error', message, ...args);
  }

  static debug(message, ...args) {
    if (config.NODE_ENV !== 'production') {
      this.log('debug', message, ...args);
    }
  }

  // Request logging middleware
  static requestLogger(req, res, next) {
    if (config.NODE_ENV !== 'production') {
      this.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
    next();
  }
}

module.exports = Logger;
