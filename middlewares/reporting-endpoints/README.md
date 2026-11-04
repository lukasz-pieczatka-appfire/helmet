# Reporting-Endpoints middleware

The [`Reporting-Endpoints` HTTP header](https://w3c.github.io/reporting/#header) maps names to URLs where browsers should send reports, such as Content Security Policy violation reports. Other headers can then refer to those names. For example, the `report-to` directive of `Content-Security-Policy` refers to an endpoint by name.

Each URL must be an absolute HTTPS URL, and at least one endpoint is required. Endpoint names must be lowercase and match `^[a-z*][a-z0-9_\-.*]*$`. Invalid options throw when the middleware is created.

Usage:

```javascript
const reportingEndpoints = require("reporting-endpoints");

app.use(
  reportingEndpoints({
    endpoints: { "csp-endpoint": "https://example.com/csp-reports" },
  })
);
// Reporting-Endpoints: csp-endpoint="https://example.com/csp-reports"

app.use(
  reportingEndpoints({
    endpoints: {
      a: "https://a.example/r",
      b: "https://b.example/r",
    },
  })
);
// Reporting-Endpoints: a="https://a.example/r", b="https://b.example/r"
```
