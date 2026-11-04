import { IncomingMessage, ServerResponse } from "http";

export interface ReportingEndpointsOptions {
  endpoints: Record<string, string>;
}

const NAME_PATTERN = /^[a-z*][a-z0-9_\-.*]*$/;
const PRINTABLE_ASCII_PATTERN = /^[\x20-\x7e]*$/;

function quote(value: string): string {
  return `"${value.replace(/[\\"]/g, "\\$&")}"`;
}

function getHeaderValueFromOptions({
  endpoints,
}: Readonly<ReportingEndpointsOptions> = {} as ReportingEndpointsOptions): string {
  if (typeof endpoints !== "object" || endpoints === null) {
    throw new Error("Reporting-Endpoints requires an endpoints object");
  }

  const names = Object.keys(endpoints);
  if (names.length === 0) {
    throw new Error("Reporting-Endpoints received no endpoints");
  }

  return names
    .map((name) => {
      if (!NAME_PATTERN.test(name)) {
        throw new Error(
          `Reporting-Endpoints received an invalid endpoint name ${JSON.stringify(
            name
          )}`
        );
      }

      const url = endpoints[name];

      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch (_err) {
        throw new Error(
          `Reporting-Endpoints received an invalid URL for endpoint ${JSON.stringify(
            name
          )}`
        );
      }

      if (parsed.protocol !== "https:") {
        throw new Error(
          `Reporting-Endpoints requires an HTTPS URL for endpoint ${JSON.stringify(
            name
          )}`
        );
      }

      if (!PRINTABLE_ASCII_PATTERN.test(url)) {
        throw new Error(
          `Reporting-Endpoints received a URL with non-printable characters for endpoint ${JSON.stringify(
            name
          )}`
        );
      }

      return `${name}=${quote(url)}`;
    })
    .join(", ");
}

function reportingEndpoints(options: Readonly<ReportingEndpointsOptions>) {
  const headerValue = getHeaderValueFromOptions(options);

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
