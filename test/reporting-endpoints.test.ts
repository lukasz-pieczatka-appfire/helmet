import { check } from "./helpers";
import reportingEndpoints from "../middlewares/reporting-endpoints";

describe("Reporting-Endpoints middleware", () => {
  it("sets a single endpoint as a quoted string and calls next()", async () => {
    await check(
      reportingEndpoints({
        endpoints: { "csp-endpoint": "https://example.com/csp-reports" },
      }),
      {
        "reporting-endpoints": 'csp-endpoint="https://example.com/csp-reports"',
      }
    );
  });

  it("joins multiple endpoints with ', ' in declaration order", async () => {
    await check(
      reportingEndpoints({
        endpoints: { a: "https://a.example/r", b: "https://b.example/r" },
      }),
      {
        "reporting-endpoints":
          'a="https://a.example/r", b="https://b.example/r"',
      }
    );
  });

  it("follows the insertion order of the endpoints", async () => {
    await check(
      reportingEndpoints({
        endpoints: { b: "https://b.example/r", a: "https://a.example/r" },
      }),
      {
        "reporting-endpoints":
          'b="https://b.example/r", a="https://a.example/r"',
      }
    );
  });

  it("backslash-escapes double quotes and backslashes in URLs", async () => {
    await check(
      reportingEndpoints({ endpoints: { a: 'https://a.example/x"y\\z' } }),
      { "reporting-endpoints": 'a="https://a.example/x\\"y\\\\z"' }
    );
  });

  it("accepts names using '*', '_', '.' and '-'", async () => {
    await check(
      reportingEndpoints({
        endpoints: {
          "csp-endpoint": "https://a.example/r",
          "a.b_c*": "https://b.example/r",
          "*star": "https://c.example/r",
        },
      }),
      {
        "reporting-endpoints":
          'csp-endpoint="https://a.example/r", a.b_c*="https://b.example/r", *star="https://c.example/r"',
      }
    );
  });

  it("accepts an endpoints object with no prototype", async () => {
    const endpoints = Object.create(null);
    endpoints.a = "https://a.example/r";

    await check(reportingEndpoints({ endpoints }), {
      "reporting-endpoints": 'a="https://a.example/r"',
    });
  });

  it("throws when there are no endpoints", () => {
    expect(() => reportingEndpoints({ endpoints: {} })).toThrow(
      /^Reporting-Endpoints received no endpoints$/
    );
  });

  it("throws when the endpoints object is missing", () => {
    const missing = /^Reporting-Endpoints requires an endpoints object$/;

    expect(() => (reportingEndpoints as any)()).toThrow(missing);
    expect(() => reportingEndpoints({} as any)).toThrow(missing);
  });

  it("throws when endpoints is null", () => {
    expect(() => reportingEndpoints({ endpoints: null as any })).toThrow(
      /^Reporting-Endpoints requires an endpoints object$/
    );
  });

  it("throws when endpoints is not an object", () => {
    expect(() =>
      reportingEndpoints({ endpoints: "https://a.example" as any })
    ).toThrow(/^Reporting-Endpoints requires an endpoints object$/);
  });

  it("throws for non-HTTPS URLs", () => {
    const message =
      /^Reporting-Endpoints requires an HTTPS URL for endpoint "a"$/;

    expect(() =>
      reportingEndpoints({ endpoints: { a: "http://example.com/r" } })
    ).toThrow(message);
    expect(() =>
      reportingEndpoints({ endpoints: { a: "http://localhost/r" } })
    ).toThrow(message);
  });

  it("throws for URLs that cannot be parsed", () => {
    const message =
      /^Reporting-Endpoints received an invalid URL for endpoint "a"$/;

    expect(() => reportingEndpoints({ endpoints: { a: "/relative" } })).toThrow(
      message
    );
    expect(() => reportingEndpoints({ endpoints: { a: "not a url" } })).toThrow(
      message
    );
  });

  it("throws for URLs with non-printable-ASCII characters", () => {
    expect(() =>
      reportingEndpoints({ endpoints: { a: "https://a.example/é" } })
    ).toThrow(
      /^Reporting-Endpoints received a URL with non-printable characters for endpoint "a"$/
    );
  });

  it("throws for invalid endpoint names", () => {
    expect(() =>
      reportingEndpoints({ endpoints: { CSP: "https://a.example/r" } })
    ).toThrow(/^Reporting-Endpoints received an invalid endpoint name "CSP"$/);
    expect(() =>
      reportingEndpoints({ endpoints: { "1bad": "https://a.example/r" } })
    ).toThrow(/^Reporting-Endpoints received an invalid endpoint name "1bad"$/);
  });

  it("does not throw for a valid name and HTTPS URL", () => {
    expect(() =>
      reportingEndpoints({
        endpoints: { "csp-endpoint": "https://example.com/csp-reports" },
      })
    ).not.toThrow();
  });
});
