# Reporting-Endpoints middleware

The [`Reporting-Endpoints` HTTP header](https://www.w3.org/TR/reporting-1/#header) maps endpoint names to the URLs that collect reports from the browser. Other headers, such as the `report-to` directive of `Content-Security-Policy`, refer to those names.

Endpoint names must start with a lowercase letter or `*` and may then contain lowercase letters, digits, `_`, `-`, `.` and `*`. Every URL must be an absolute `https:` URL. Invalid options throw when the middleware is created. Endpoints appear in the header in the order you declare them.

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
