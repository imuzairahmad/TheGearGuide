import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

// Custom level colors with background
winston.addColors({
  error: "white bgRed",
  warn: "black bgYellow",
  info: "white bgBlue",
  http: "black bgMagenta",
  debug: "white bgGreen",
});

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} ${level}: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ""
  }`;
});

export const logger = winston.createLogger({
  level: "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    colorize({ all: true }), // applies background colors
    logFormat,
  ),
  transports: [new winston.transports.Console()],
});
