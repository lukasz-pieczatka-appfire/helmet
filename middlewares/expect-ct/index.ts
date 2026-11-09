import { IncomingMessage, ServerResponse } from "http";
import { guardOptions, OptionGuard } from "../option-guards.js";

const OPTION_GUARDS: readonly OptionGuard[] = [
  {
    key: "maxage",
    level: "throw",
    message:
      "Expect-CT received an unsupported property, `maxage`. Did you mean to pass `maxAge`?",
  },
  {
    key: "reportURI",
    level: "throw",
    message:
      "Expect-CT received an unsupported property, `reportURI`. Did you mean to pass `reportUri`?",
  },
];

export interface ExpectCtOptions {
  maxAge?: number;
  enforce?: boolean;
  reportUri?: string;
}

function parseMaxAge(value: number = 0): number {
  if (value >= 0 && Number.isFinite(value)) {
    return Math.floor(value);
  } else {
    throw new Error(
      `Expect-CT: ${JSON.stringify(
        value
      )} is not a valid value for maxAge. Please choose a positive integer.`
    );
  }
}

function getHeaderValueFromOptions(options: Readonly<ExpectCtOptions>): string {
  guardOptions(options, OPTION_GUARDS);

  const directives: string[] = [`max-age=${parseMaxAge(options.maxAge)}`];

  if (options.enforce) {
    directives.push("enforce");
  }

  if (options.reportUri) {
    directives.push(`report-uri="${options.reportUri}"`);
  }

  return directives.join(", ");
}

function expectCt(options: Readonly<ExpectCtOptions> = {}) {
  const headerValue = getHeaderValueFromOptions(options);

  return function expectCtMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    res.setHeader("Expect-CT", headerValue);
    next();
  };
}

export default expectCt;
