// Tremor Raw cx [v0.0.0]

import clsx, { type ClassValue } from "clsx";
import { roundToNearestHours } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args));
}

// Tremor Raw focusInput [v0.0.1]

export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-blue-200 focus:dark:ring-blue-700/30",
  // border color
  "focus:border-blue-500 focus:dark:border-blue-700",
];

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500",
];

// Tremor Raw hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color
  "ring-red-200 dark:ring-red-700/30",
];

interface CurrencyParams {
  number: number;
  maxFractionDigits?: number;
  currency?: string;
}

interface PercentageParams {
  number: number;
  decimals?: number;
}

interface MillionParams {
  number: number;
  decimals?: number;
}

type FormatterFunctions = {
  currency: (params: CurrencyParams) => string;
  unit: (number: number) => string;
  percentage: (params: PercentageParams) => string;
  million: (params: MillionParams) => string;
};

export const formatters: FormatterFunctions = {
  currency: ({
    number,
    maxFractionDigits = 2,
    currency = "USD",
  }: CurrencyParams): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: maxFractionDigits,
    }).format(number);
  },

  unit: (number: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
    }).format(number);
  },

  percentage: ({ number, decimals = 1 }: PercentageParams): string => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);
  },

  million: ({ number, decimals = 1 }: MillionParams): string => {
    return `${new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number)}M`;
  },
};

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function dateToUnix(date: Date) {
  return Math.ceil(date.getTime() / 1000);
}

export function formatDateStr(dateStr: string) {
  const date = new Date(dateStr);

  return formatDate(date);
}

export function formatHourStr(dateStr: string) {
  const date = new Date(dateStr);

  return formatHour(date);
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }); // "Jan 25" format
}

export function formatHour(date: Date) {
  return roundToNearestHours(date, {
    roundingMethod: "ceil",
  }).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const getDateRange = (
  start: Date,
  end: Date,
  isHourly = false
): Date[] => {
  const dates: Date[] = [];
  const currentDate = wrapStartDate(start);
  const endDate = wrapEndDate(end);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));

    if (isHourly) {
      currentDate.setHours(currentDate.getHours() + 1);
      continue;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

export const wrapStartDate = (date: Date) => new Date(date.setHours(0, 0, 0));
export const wrapEndDate = (date: Date) => new Date(date.setHours(23, 59, 59));
