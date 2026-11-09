import {
  guardOptions,
  resetOptionGuardWarningsForTesting,
  OptionGuard,
} from "../middlewares/option-guards";

const guards: readonly OptionGuard[] = [
  { key: "removed", level: "throw", message: "`removed` is not supported." },
  { key: "miscased", level: "warn", message: "Use `miscasedKey` instead." },
  { key: "another", level: "warn", message: "`another` is ignored." },
];

describe("guardOptions", () => {
  beforeEach(() => {
    resetOptionGuardWarningsForTesting();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("throws an error with the exact message for a throw-level key", () => {
    expect(() => guardOptions({ removed: 1 }, guards)).toThrow(
      new Error("`removed` is not supported.")
    );
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("throws even if the throw-level key has an undefined value", () => {
    expect(() => guardOptions({ removed: undefined }, guards)).toThrow(
      new Error("`removed` is not supported.")
    );
  });

  it("warns with the exact message for a warn-level key", () => {
    expect(() => guardOptions({ miscased: true }, guards)).not.toThrow();

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith("Use `miscasedKey` instead.");
  });

  it("warns only once per process for the same key", () => {
    guardOptions({ miscased: true }, guards);
    guardOptions({ miscased: false }, guards);

    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it("warns once for each different message", () => {
    guardOptions({ miscased: true, another: true }, guards);
    guardOptions({ miscased: true, another: true }, guards);

    expect(console.warn).toHaveBeenCalledTimes(2);
    expect(console.warn).toHaveBeenCalledWith("Use `miscasedKey` instead.");
    expect(console.warn).toHaveBeenCalledWith("`another` is ignored.");
  });

  it("warns again after the warnings are reset", () => {
    guardOptions({ miscased: true }, guards);
    resetOptionGuardWarningsForTesting();
    guardOptions({ miscased: true }, guards);

    expect(console.warn).toHaveBeenCalledTimes(2);
  });

  it("goes through guards in declared order", () => {
    const options = { removed: 1, miscased: true };

    expect(() => guardOptions(options, guards)).toThrow();
    expect(console.warn).not.toHaveBeenCalled();

    expect(() => guardOptions(options, [guards[1]!, guards[0]!])).toThrow();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it("does nothing for an empty object", () => {
    expect(() => guardOptions({}, guards)).not.toThrow();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("does nothing for an object with no prototype", () => {
    expect(() => guardOptions(Object.create(null), guards)).not.toThrow();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("detects keys on an object with no prototype", () => {
    const options = Object.create(null);
    options.removed = 1;

    expect(() => guardOptions(options, guards)).toThrow();
  });

  it("ignores keys that are not listed", () => {
    expect(() =>
      guardOptions({ unlisted: 1, alsoUnlisted: true }, guards)
    ).not.toThrow();
    expect(console.warn).not.toHaveBeenCalled();
  });
});
