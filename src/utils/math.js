export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

/** value ning start va end orasidagi ulushi, 0 dan 1 gacha. */
export const progressBetween = (value, start, end) => clamp((value - start) / (end - start));

export const lerp = (from, to, amount) => from + (to - from) * amount;

export const easeOutCubic = (t) => 1 - (1 - t) ** 3;

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
