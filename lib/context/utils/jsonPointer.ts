export function normalizePointer(pointer: string): string[] {
  if (!pointer) return [];
  return pointer
    .split("/")
    .map((segment) =>
      segment
        .replace(/~1/g, "/")
        .replace(/~0/g, "~")
        .trim()
    )
    .filter(Boolean);
}

function cloneContainer(value: unknown) {
  if (Array.isArray(value)) {
    return [...value];
  }
  if (value && typeof value === "object") {
    return { ...(value as Record<string, unknown>) };
  }
  return value;
}

function coerceSegment(segment: string): string | number {
  if (segment === "-") return segment;
  if (/^\d+$/.test(segment)) {
    return Number(segment);
  }
  return segment;
}

export function getValueAtPointer<T = unknown, R = unknown>(source: T, pointer: string): R | undefined {
  const segments = normalizePointer(pointer);
  if (segments.length === 0) return source as unknown as R;
  let current: any = source;
  for (const rawSegment of segments) {
    if (current == null) return undefined;
    const segment = coerceSegment(rawSegment);
    if (segment === "-") return undefined;
    current = current[segment as keyof typeof current];
  }
  return current as R;
}

export function setValueAtPointer<T>(source: T, pointer: string, value: unknown): T {
  const segments = normalizePointer(pointer);
  if (segments.length === 0) {
    return value as T;
  }

  const result = cloneContainer(source) as any;
  let current = result;

  segments.forEach((rawSegment, idx) => {
    const isLast = idx === segments.length - 1;
    const segment = coerceSegment(rawSegment);

    if (isLast) {
      if (segment === "-") {
        if (!Array.isArray(current)) {
          throw new Error(`Cannot append using '-' on non-array segment for pointer ${pointer}`);
        }
        current.push(value);
      } else {
        current[segment as keyof typeof current] = value;
      }
      return;
    }

    const nextSegment = segments[idx + 1];
    const nextIsIndex = /^\d+$/.test(nextSegment);
    const existing = segment === "-" ? undefined : current[segment as keyof typeof current];

    if (existing == null) {
      current[segment as keyof typeof current] = nextIsIndex ? [] : {};
    } else {
      current[segment as keyof typeof current] = cloneContainer(existing);
    }

    current = current[segment as keyof typeof current];
  });

  return result;
}

export function deleteValueAtPointer<T>(source: T, pointer: string): T {
  const segments = normalizePointer(pointer);
  if (segments.length === 0) return source;

  const result = cloneContainer(source) as any;
  let current = result;

  segments.forEach((rawSegment, idx) => {
    const isLast = idx === segments.length - 1;
    const segment = coerceSegment(rawSegment);

    if (current == null) return;

    if (isLast) {
      if (Array.isArray(current) && typeof segment === "number") {
        current.splice(segment, 1);
      } else {
        delete current[segment as keyof typeof current];
      }
      return;
    }

    const next = current[segment as keyof typeof current];
    if (next == null) {
      return;
    }
    current[segment as keyof typeof current] = cloneContainer(next);
    current = current[segment as keyof typeof current];
  });

  return result;
}

export function pointerFromPath(...segments: Array<string | number>) {
  return segments
    .map((segment) => (typeof segment === "number" ? segment.toString() : segment.replace(/\//g, "~1")))
    .join("/");
}
