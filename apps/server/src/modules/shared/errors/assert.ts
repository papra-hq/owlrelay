export function assert<T>(condition: T, errorOrFactory: Error | (() => Error)): asserts condition is NonNullable<T> {
  const factory = errorOrFactory instanceof Error ? () => errorOrFactory : errorOrFactory;

  if (!condition) {
    throw factory();
  }
}
