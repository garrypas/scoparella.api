import {bind, BindingScope, uuid} from "@loopback/core";
import {Logger as TsLogger, TLogLevelName} from "tslog";
export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
  trace(message: string): void;
}

function getLogLevel(): TLogLevelName {
  const level = process.env.LOG_LEVEL as TLogLevelName;
  return ["trace", "info", "warn", "error"].includes(level) ? level : "warn";
}
const logLevel: TLogLevelName = getLogLevel();

@bind({scope: BindingScope.TRANSIENT})
export class ConsoleLogger implements Logger {
  private logger: TsLogger;
  private correlationId: string;
  constructor() {
    this.logger = new TsLogger({name: "scoparella.api", minLevel: logLevel});
    this.correlationId = uuid();
  }

  info(message: string) {
    this.logger.info(message, this.correlationId);
  }

  warn(message: string) {
    this.logger.warn(message, this.correlationId);
  }

  error(message: string) {
    this.logger.error(message, this.correlationId);
  }

  debug(message: string) {
    this.logger.debug(message, this.correlationId);
  }

  trace(message: string) {
    this.logger.trace(message, this.correlationId);
  }
}
