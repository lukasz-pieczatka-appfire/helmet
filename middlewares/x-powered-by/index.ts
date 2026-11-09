import { IncomingMessage, ServerResponse } from "http";
import { guardOptions, OptionGuard } from "../option-guards.js";

const OPTION_GUARDS: readonly OptionGuard[] = [
  {
    key: "setTo",
    level: "warn",
    message:
      "X-Powered-By middleware no longer supports the `setTo` parameter. See <https://github.com/helmetjs/helmet/wiki/How-to-set-a-custom-X%E2%80%93Powered%E2%80%93By-header> if you need help replicating this behavior.",
  },
];

function xPoweredBy(options: Readonly<object> = {}) {
  guardOptions(options, OPTION_GUARDS);

  return function xPoweredByMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    res.removeHeader("X-Powered-By");
    next();
  };
}

export default xPoweredBy;
