export function coerceDate<T extends { createdAt: string; updatedAt: string }>(
  obj: T,
): T & { createdAt: Date; updatedAt: Date } {
  return {
    ...obj,
    createdAt: new Date(obj.createdAt),
    updatedAt: new Date(obj.updatedAt),
  } as T & { createdAt: Date; updatedAt: Date };
}
