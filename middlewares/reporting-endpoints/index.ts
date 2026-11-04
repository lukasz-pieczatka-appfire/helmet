import { IncomingMessage, ServerResponse } from "http";

export interface ReportingEndpointsOptions {
  endpoints: Record<string, string>;
}

const VALID_NAME_REGEX = /^[a-z*][a-z0-9_\-.*]*$/;
const UNSERIALIZABLE_CHARACTER_REGEX = /[^\x20-\x7E]/;
const ESCAPE_REGEX = /[\\"]/g;

function getHeaderValueFromOptions({
  endpoints,
}: Readonly<Partial<ReportingEndpointsOptions>>): string {
  const names = endpoints ? Object.keys(endpoints) : [];

  if (names.length === 0) {
    throw new Error("Reporting-Endpoints received no endpoints");
  }

  return names
    .map((name) => {
      if (!VALID_NAME_REGEX.test(name)) {
        throw new Error(
          `Reporting-Endpoints received an invalid endpoint name ${JSON.stringify(
            name
          )}`
        );
      }

      const url: unknown = endpoints?.[name];

      let parsed: URL;
      try {
        if (typeof url !== "string") {
          throw new TypeError("URL must be a string");
        }
        parsed = new URL(url);
      } catch {
        throw new Error(
          `Reporting-Endpoints received an invalid URL ${JSON.stringify(url)}`
        );
      }

      if (parsed.protocol !== "https:") {
        throw new Error(
          `Reporting-Endpoints received a non-HTTPS URL ${JSON.stringify(url)}`
        );
      }

      if (UNSERIALIZABLE_CHARACTER_REGEX.test(url as string)) {
        throw new Error(
          `Reporting-Endpoints received a URL that cannot be serialized ${JSON.stringify(
            url
          )}`
        );
      }

      return `${name}="${(url as string).replace(ESCAPE_REGEX, "\\$&")}"`;
    })
    .join(", ");
}

function reportingEndpoints(options: Readonly<ReportingEndpointsOptions>) {
  const headerValue = getHeaderValueFromOptions(options ?? {});

  return function reportingEndpointsMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    res.setHeader("Reporting-Endpoints", headerValue);
    next();
  };
}

// !helmet-start-of-commonjs-exports
export default reportingEndpoints;
// !helmet-end-of-commonjs-exports
