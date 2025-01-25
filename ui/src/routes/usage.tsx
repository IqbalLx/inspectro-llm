import { DateRange, DateRangePicker } from "@/components/ui/DatePicker";
import { Card } from "@/components/ui/Card";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/usage")({
  component: Usage,
  beforeLoad: () => {
    return {
      getTitle: () => "Usage",
    };
  },
});

const presets = [
  {
    label: "Today",
    dateRange: {
      from: new Date(),
      to: new Date(),
    },
  },
  {
    label: "Last 7 days",
    dateRange: {
      from: new Date(new Date().setDate(new Date().getDate() - 7)),
      to: new Date(),
    },
  },
  {
    label: "Last 30 days",
    dateRange: {
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date(),
    },
  },
  {
    label: "Last 3 months",
    dateRange: {
      from: new Date(new Date().setMonth(new Date().getMonth() - 3)),
      to: new Date(),
    },
  },
  {
    label: "Last 6 months",
    dateRange: {
      from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
      to: new Date(),
    },
  },
  {
    label: "Month to date",
    dateRange: {
      from: new Date(new Date().setDate(1)),
      to: new Date(),
    },
  },
  {
    label: "Year to date",
    dateRange: {
      from: new Date(new Date().setFullYear(new Date().getFullYear(), 0, 1)),
      to: new Date(),
    },
  },
];

export function Usage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    presets[1].dateRange // default to last 7 day
  );

  return (
    <div className="flex flex-col items-start w-full m-4">
      <div className="flex flex-row-reverse w-full pr-6 justify-between">
        <div>
          <DateRangePicker
            showTimePicker
            presets={presets}
            value={dateRange}
            onChange={setDateRange}
            toDate={new Date()}
          />
        </div>

        <div className="flex flex-row gap-4 grow justify-start items-start max-w-lg">
          <Card className="mx-auto max-w-sm">
            <h1 className="font-semibold text-gray-900 dark:text-gray-50">
              Total Spending
            </h1>
            <p className="text-gray-900 dark:text-gray-50">$100</p>
          </Card>
          <Card className="mx-auto max-w-sm">
            <h1 className="font-semibold text-gray-900 dark:text-gray-50">
              Total Tokens
            </h1>
            <p className="text-gray-900 dark:text-gray-50">1024</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
