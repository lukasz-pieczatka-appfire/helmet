export interface OptionGuard {
  key: string;
  level: "throw" | "warn";
  message: string;
}

const warnedMessages = new Set<string>();

export function guardOptions(
  options: Readonly<object>,
  guards: readonly OptionGuard[]
): void {
  for (const { key, level, message } of guards) {
    if (!(key in options)) {
      continue;
    }
    if (level === "throw") {
      throw new Error(message);
    }
    if (!warnedMessages.has(message)) {
      warnedMessages.add(message);
      console.warn(message);
    }
  }
}

export function resetOptionGuardWarningsForTesting(): void {
  warnedMessages.clear();
}
