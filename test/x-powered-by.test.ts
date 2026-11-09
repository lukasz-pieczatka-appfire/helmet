import { check } from "./helpers";
import xPoweredBy from "../middlewares/x-powered-by";
import { resetOptionGuardWarningsForTesting } from "../middlewares/option-guards";

describe("X-Powered-By middleware", () => {
  it("does nothing if the request was not set earlier in the stack", async () => {
    await check(xPoweredBy(), {
      "x-powered-by": null,
    });
  });

  it("removes the header if it was set earlier in the stack", async () => {
    await check(
      (req, res, next) => {
        res.setHeader("X-POWERED-BY", "should be destroyed");
        xPoweredBy()(req, res, next);
      },
      {
        "x-powered-by": null,
      }
    );
  });

  describe("warnings for legacy usage", () => {
    beforeEach(() => {
      resetOptionGuardWarningsForTesting();
      jest.spyOn(console, "warn").mockImplementation(() => {});
    });

    it("logs a warning when using the `setTo` parameter, and still removes the header", async () => {
      const middleware = xPoweredBy({ setTo: "PHP" } as any);

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "X-Powered-By middleware no longer supports the `setTo` parameter. See <https://github.com/helmetjs/helmet/wiki/How-to-set-a-custom-X%E2%80%93Powered%E2%80%93By-header> if you need help replicating this behavior."
      );

      await check(middleware, {
        "x-powered-by": null,
      });
    });

    it("only warns once when building the middleware twice", () => {
      xPoweredBy({ setTo: "PHP" } as any);
      xPoweredBy({ setTo: "PHP" } as any);

      expect(console.warn).toHaveBeenCalledTimes(1);
    });

    it("does not warn when passed no options or empty options", () => {
      xPoweredBy();
      xPoweredBy({});

      expect(console.warn).not.toHaveBeenCalled();
    });
  });
});
