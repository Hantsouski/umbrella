import { LogLevel, type ILogger } from "./api.js";

/**
 * No-op {@link ILogger} implementation, used as default logger for most
 * packages (where used).
 */
export const NULL_LOGGER: ILogger = Object.freeze({
	level: LogLevel.NONE,
	enabled: () => false,
	fine() {},
	debug() {},
	info() {},
	warn() {},
	severe() {},
});
