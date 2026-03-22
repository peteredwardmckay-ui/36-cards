export interface SeededRandom {
  next: () => number;
  nextInt: (minInclusive: number, maxInclusive: number) => number;
}

export function hashStringToInt(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createMulberry32(seed: number): SeededRandom {
  let state = seed >>> 0;

  const next = () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const nextInt = (minInclusive: number, maxInclusive: number) => {
    const min = Math.ceil(minInclusive);
    const max = Math.floor(maxInclusive);
    return Math.floor(next() * (max - min + 1)) + min;
  };

  return { next, nextInt };
}

export function gaussianRandom(rng: SeededRandom, mean = 0, stdev = 1): number {
  let u = 0;
  let v = 0;

  while (u === 0) {
    u = rng.next();
  }
  while (v === 0) {
    v = rng.next();
  }

  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
