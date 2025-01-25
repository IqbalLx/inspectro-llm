// Tremor Raw chartColors [v0.1.0]

export type ColorUtility = "bg" | "stroke" | "fill" | "text";

export const chartColors = {
  blue: {
    bg: "bg-blue-500",
    stroke: "stroke-blue-500",
    fill: "fill-blue-500",
    text: "text-blue-500",
  },
  emerald: {
    bg: "bg-emerald-500",
    stroke: "stroke-emerald-500",
    fill: "fill-emerald-500",
    text: "text-emerald-500",
  },
  violet: {
    bg: "bg-violet-500",
    stroke: "stroke-violet-500",
    fill: "fill-violet-500",
    text: "text-violet-500",
  },
  amber: {
    bg: "bg-amber-500",
    stroke: "stroke-amber-500",
    fill: "fill-amber-500",
    text: "text-amber-500",
  },
  gray: {
    bg: "bg-gray-500",
    stroke: "stroke-gray-500",
    fill: "fill-gray-500",
    text: "text-gray-500",
  },
  cyan: {
    bg: "bg-cyan-500",
    stroke: "stroke-cyan-500",
    fill: "fill-cyan-500",
    text: "text-cyan-500",
  },
  pink: {
    bg: "bg-pink-500",
    stroke: "stroke-pink-500",
    fill: "fill-pink-500",
    text: "text-pink-500",
  },
} as const satisfies {
  [color: string]: {
    [key in ColorUtility]: string;
  };
};

export type AvailableChartColorsKeys = keyof typeof chartColors;

export const AvailableChartColors: AvailableChartColorsKeys[] = Object.keys(
  chartColors
) as Array<AvailableChartColorsKeys>;

export const constructCategoryColors = (
  categories: string[],
  colors: AvailableChartColorsKeys[]
): Map<string, AvailableChartColorsKeys> => {
  const categoryColors = new Map<string, AvailableChartColorsKeys>();
  categories.forEach((category, index) => {
    categoryColors.set(category, colors[index % colors.length]);
  });
  return categoryColors;
};

export const getColorClassName = (
  color: AvailableChartColorsKeys,
  type: ColorUtility
): string => {
  const fallbackColor = {
    bg: "bg-gray-500",
    stroke: "stroke-gray-500",
    fill: "fill-gray-500",
    text: "text-gray-500",
  };
  return chartColors[color]?.[type] ?? fallbackColor[type];
};

// Tremor Raw getYAxisDomain [v0.0.0]

export const getYAxisDomain = (
  autoMinValue: boolean,
  minValue: number | undefined,
  maxValue: number | undefined
) => {
  const minDomain = autoMinValue ? "auto" : (minValue ?? 0);
  const maxDomain = maxValue ?? "auto";
  return [minDomain, maxDomain];
};

// Tremor Raw hasOnlyOneValueForKey [v0.1.0]

export function hasOnlyOneValueForKey(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  array: any[],
  keyToCheck: string
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const val: any[] = [];

  for (const obj of array) {
    if (Object.prototype.hasOwnProperty.call(obj, keyToCheck)) {
      val.push(obj[keyToCheck]);
      if (val.length > 1) {
        return false;
      }
    }
  }

  return true;
}

export const chartGradientColors = {
  blue: "from-blue-200 to-blue-500 dark:from-blue-200/10 dark:to-blue-400",
  lightBlue: "from-blue-200 to-blue-500 dark:from-blue-200/10 dark:to-blue-400",
  emerald:
    "from-emerald-200 to-emerald-500 dark:from-emerald-200/10 dark:to-emerald-400",
  lightEmerald:
    "from-emerald-200 to-emerald-500 dark:from-emerald-200/10 dark:to-emerald-400",
  violet:
    "from-violet-200 to-violet-500 dark:from-violet-200/10 dark:to-violet-400",
  amber: "from-amber-200 to-amber-500 dark:from-amber-200/10 dark:to-amber-400",
  gray: "from-gray-200 to-gray-500 dark:from-gray-200/10 dark:to-gray-400",
  lightGray: "from-gray-200 to-gray-500 dark:from-gray-200/10 dark:to-gray-400",
  rose: "from-rose-200 to-rose-500 dark:from-rose-200/10 dark:to-rose-400",
  sky: "from-sky-200 to-sky-500 dark:from-sky-200/10 dark:to-sky-400",
  cyan: "from-cyan-200 to-cyan-500 dark:from-cyan-200/10 dark:to-cyan-400",
  indigo:
    "from-indigo-200 to-indigo-500 dark:from-indigo-200/10 dark:to-indigo-400",
  orange:
    "from-orange-200 to-orange-500 dark:from-orange-200/10 dark:to-orange-400",
  pink: "from-pink-200 to-pink-500 dark:from-pink-200/10 dark:to-pink-400",
  red: "from-red-200 to-red-500 dark:from-red-200/10 dark:to-red-400",
} as const satisfies Record<string, string>;

export const chartConditionalColors = {
  blue: {
    low: "fill-blue-200 dark:fill-blue-300",
    medium: "fill-blue-300 dark:fill-blue-400",
    high: "fill-blue-400 dark:fill-blue-500",
    critical: "fill-blue-500 dark:fill-blue-600",
  },
  lightBlue: {
    low: "fill-blue-200 dark:fill-blue-300",
    medium: "fill-blue-300 dark:fill-blue-400",
    high: "fill-blue-400 dark:fill-blue-500",
    critical: "fill-blue-500 dark:fill-blue-600",
  },
  emerald: {
    low: "fill-emerald-200 dark:fill-emerald-300",
    medium: "fill-emerald-300 dark:fill-emerald-400",
    high: "fill-emerald-400 dark:fill-emerald-500",
    critical: "fill-emerald-500 dark:fill-emerald-600",
  },
  lightEmerald: {
    low: "fill-emerald-200 dark:fill-emerald-300",
    medium: "fill-emerald-300 dark:fill-emerald-400",
    high: "fill-emerald-400 dark:fill-emerald-500",
    critical: "fill-emerald-500 dark:fill-emerald-600",
  },
  violet: {
    low: "fill-violet-200 dark:fill-violet-300",
    medium: "fill-violet-300 dark:fill-violet-400",
    high: "fill-violet-400 dark:fill-violet-500",
    critical: "fill-violet-500 dark:fill-violet-600",
  },
  amber: {
    low: "fill-amber-200 dark:fill-amber-300",
    medium: "fill-amber-300 dark:fill-amber-400",
    high: "fill-amber-400 dark:fill-amber-500",
    critical: "fill-amber-500 dark:fill-amber-600",
  },
  gray: {
    low: "fill-gray-200 dark:fill-gray-300",
    medium: "fill-gray-300 dark:fill-gray-400",
    high: "fill-gray-400 dark:fill-gray-500",
    critical: "fill-gray-500 dark:fill-gray-600",
  },
  rose: {
    low: "fill-rose-200 dark:fill-rose-300",
    medium: "fill-rose-300 dark:fill-rose-400",
    high: "fill-rose-400 dark:fill-rose-500",
    critical: "fill-rose-500 dark:fill-rose-600",
  },
  sky: {
    low: "fill-sky-200 dark:fill-sky-300",
    medium: "fill-sky-300 dark:fill-sky-400",
    high: "fill-sky-400 dark:fill-sky-500",
    critical: "fill-sky-500 dark:fill-sky-600",
  },
  cyan: {
    low: "fill-cyan-200 dark:fill-cyan-300",
    medium: "fill-cyan-300 dark:fill-cyan-400",
    high: "fill-cyan-400 dark:fill-cyan-500",
    critical: "fill-cyan-500 dark:fill-cyan-600",
  },
  indigo: {
    low: "fill-indigo-200 dark:fill-indigo-300",
    medium: "fill-indigo-300 dark:fill-indigo-400",
    high: "fill-indigo-400 dark:fill-indigo-500",
    critical: "fill-indigo-500 dark:fill-indigo-600",
  },
  orange: {
    low: "fill-orange-200 dark:fill-orange-300",
    medium: "fill-orange-300 dark:fill-orange-400",
    high: "fill-orange-400 dark:fill-orange-500",
    critical: "fill-orange-500 dark:fill-orange-600",
  },
  pink: {
    low: "fill-pink-200 dark:fill-pink-300",
    medium: "fill-pink-300 dark:fill-pink-400",
    high: "fill-pink-400 dark:fill-pink-500",
    critical: "fill-pink-500 dark:fill-pink-600",
  },
  red: {
    low: "fill-red-200 dark:fill-red-300",
    medium: "fill-red-300 dark:fill-red-400",
    high: "fill-red-400 dark:fill-red-500",
    critical: "fill-red-500 dark:fill-red-600",
  },
  lightGray: {
    low: "fill-gray-200 dark:fill-gray-300",
    medium: "fill-gray-300 dark:fill-gray-400",
    high: "fill-gray-400 dark:fill-gray-500",
    critical: "fill-gray-500 dark:fill-gray-600",
  },
};

export type AvailableChartConditionalColorsKeys = keyof typeof chartColors;

export const getGradientColorClassName = (
  color: AvailableChartColorsKeys
): string => {
  return chartGradientColors[color];
};

export const getConditionalColorClassName = (
  value: number,
  color: AvailableChartConditionalColorsKeys
) => {
  const fallbackColors = {
    low: "fill-gray-300 dark:fill-gray-400",
    medium: "fill-gray-400 dark:fill-gray-500",
    high: "fill-gray-500 dark:fill-gray-600",
    critical: "fill-gray-600 dark:fill-gray-700",
  };

  const classes = chartConditionalColors[color] ?? fallbackColors;

  if (value <= 0.25) return classes.low;
  if (value <= 0.5) return classes.medium;
  if (value <= 0.75) return classes.high;
  return classes.critical;
};
