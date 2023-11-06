import { ConsoleLogger } from "@thi.ng/logger";
import { setLogger } from "../src/index.js";

/**
 * Default base delay for time based tests
 */
export const TIMEOUT = 50;

export const withLogger = () => setLogger(new ConsoleLogger("rstream"));
