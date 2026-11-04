import { check } from "./helpers";
import reportingEndpoints from "../middlewares/reporting-endpoints";

describe("Reporting-Endpoints middleware", () => {
  it("sets the header for a single endpoint and calls next()", async () => {
    await check(
      reportingEndpoints({
        endpoints: { "csp-endpoint": "https://example.com/csp-reports" },
      }),
      {
        "reporting-endpoints": 'csp-endpoint="https://example.com/csp-reports"',
      }
    );
  });

  it("joins multiple endpoints with a comma and space", async () => {
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

  it("preserves declaration order", async () => {
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

  it("backslash-escapes double quotes in URLs", async () => {
    await check(
      reportingEndpoints({ endpoints: { a: 'https://a.example/r"q' } }),
      { "reporting-endpoints": 'a="https://a.example/r\\"q"' }
    );
  });

  it("backslash-escapes backslashes in URLs", async () => {
    await check(
      reportingEndpoints({ endpoints: { a: "https://a.example/r\\q" } }),
      { "reporting-endpoints": 'a="https://a.example/r\\\\q"' }
    );
  });

  it("accepts `*` as an endpoint name", async () => {
    await check(
      reportingEndpoints({ endpoints: { "*": "https://a.example/r" } }),
      { "reporting-endpoints": '*="https://a.example/r"' }
    );
  });

  it("accepts names with underscores, hyphens, dots and asterisks", async () => {
    await check(
      reportingEndpoints({
        endpoints: { "csp_report.v-1*": "https://a.example/r" },
      }),
      { "reporting-endpoints": 'csp_report.v-1*="https://a.example/r"' }
    );
  });

  describe("invalid options", () => {
    const missingEndpoints: [string, () => unknown][] = [
      ["no arguments", () => (reportingEndpoints as any)()],
      ["an empty options object", () => reportingEndpoints({} as any)],
      [
        "an empty endpoints object",
        () => reportingEndpoints({ endpoints: {} }),
      ],
      [
        "undefined endpoints",
        () => reportingEndpoints({ endpoints: undefined } as any),
      ],
    ];
    missingEndpoints.forEach(([description, fn]) => {
      it(`throws with ${description}`, () => {
        expect(fn).toThrow(/^Reporting-Endpoints received no endpoints$/);
      });
    });

    ["http://example.com/r", "http://localhost/r"].forEach((url) => {
      it(`throws for the non-HTTPS URL ${url}`, () => {
        expect(() => reportingEndpoints({ endpoints: { a: url } })).toThrow(
          new RegExp(
            `^Reporting-Endpoints received a non-HTTPS URL "${url.replace(
              /[./]/g,
              "\\$&"
            )}"$`
          )
        );
      });
    });

    it("throws for a relative URL", () => {
      expect(() =>
        reportingEndpoints({ endpoints: { a: "/relative" } })
      ).toThrow(/^Reporting-Endpoints received an invalid URL "\/relative"$/);
    });

    it("throws for an unparseable URL", () => {
      expect(() =>
        reportingEndpoints({ endpoints: { a: "not a url" } })
      ).toThrow(/^Reporting-Endpoints received an invalid URL "not a url"$/);
    });

    it("throws for a non-string URL", () => {
      expect(() =>
        reportingEndpoints({ endpoints: { a: 123 as any } })
      ).toThrow(/^Reporting-Endpoints received an invalid URL 123$/);
    });

    ["CSP", "1bad", ""].forEach((name) => {
      it(`throws for the invalid endpoint name ${JSON.stringify(name)}`, () => {
        expect(() =>
          reportingEndpoints({ endpoints: { [name]: "https://a.example/r" } })
        ).toThrow(
          new RegExp(
            `^Reporting-Endpoints received an invalid endpoint name "${name}"$`
          )
        );
      });
    });

    it("throws for a URL containing a non-ASCII character", () => {
      expect(() =>
        reportingEndpoints({ endpoints: { a: "https://a.example/é" } })
      ).toThrow(
        /^Reporting-Endpoints received a URL that cannot be serialized /
      );
    });

    it("throws for a URL containing a tab character", () => {
      expect(() =>
        reportingEndpoints({ endpoints: { a: "https://a.example/r\tq" } })
      ).toThrow(
        /^Reporting-Endpoints received a URL that cannot be serialized /
      );
    });

    it("throws at construction time, before any request is made", () => {
      let middleware: unknown;
      expect(() => {
        middleware = reportingEndpoints({
          endpoints: { a: "http://a.example/r" },
        });
      }).toThrow();
      expect(middleware).toBeUndefined();
    });
  });
});
