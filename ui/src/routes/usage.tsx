import { DateRange, DateRangePicker } from "@/components/ui/DatePicker";
import { Card } from "@/components/ui/Card";
import { createFileRoute } from "@tanstack/react-router";
import { DATE_PICKER_RANGE_PRESETS as presets } from "@/lib/constants";
import React, { useEffect } from "react";
import { fetchLLMUsages, LLMUsageUI, mapUsageForUI } from "@/repo/usage.repo";
import { useQuery } from "@tanstack/react-query";

// @ts-expect-error no types
import { prettyDigits } from "prettydigits";
import { LLMUsageCard } from "@/components/LLMUsageCard";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export const Route = createFileRoute("/usage")({
  component: Usage,
  beforeLoad: () => {
    return {
      getTitle: () => "Usage",
    };
  },
});

export function Usage() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    presets[1].dateRange // default to last 7 day
  );

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["usage", dateRange],
    queryFn: () => fetchLLMUsages(dateRange?.from, dateRange?.to),
    refetchInterval: 1000 * 5, // seconds
    gcTime: 0,
  });

  const [mappedDatas, setMappedDatas] = React.useState<LLMUsageUI[]>([]);

  useEffect(() => {
    if (
      data === undefined ||
      dateRange?.from === undefined ||
      dateRange.to === undefined
    )
      return;

    setMappedDatas(mapUsageForUI(data.usages, dateRange.from, dateRange.to));
  }, [data, dateRange?.from, dateRange?.to]);

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div className="flex flex-col items-start w-full m-4 gap-4">
      <div className="flex flex-row w-full justify-between">
        <div className="flex flex-row gap-4 grow justify-start items-start w-3/4 flex-wrap">
          <Card className="w-1/5">
            <h1 className="font-semibold text-gray-900 dark:text-gray-50">
              Total Spending
            </h1>
            <p className="text-gray-900 dark:text-gray-50">
              ${prettyDigits(data?.all_time_spending.money ?? 0)}
            </p>
          </Card>
          <Card className="w-1/5">
            <h1 className="font-semibold text-gray-900 dark:text-gray-50">
              Current Spending
            </h1>
            <p className="text-gray-900 dark:text-gray-50">
              ${prettyDigits(data?.current_spending.money ?? 0)}
            </p>
          </Card>
          <Card className="w-1/5">
            <h1 className="font-semibold text-gray-900 dark:text-gray-50">
              Total Tokens
            </h1>
            <p className="text-gray-900 dark:text-gray-50">
              {prettyDigits(data?.all_time_spending.token ?? 0)}
            </p>
          </Card>
          <Card className="w-1/5">
            <h1 className="font-semibold text-gray-900 dark:text-gray-50">
              Current Tokens
            </h1>
            <p className="text-gray-900 dark:text-gray-50">
              {prettyDigits(data?.current_spending.token ?? 0)}
            </p>
          </Card>
        </div>

        <div>
          <DateRangePicker
            presets={presets}
            value={dateRange}
            onChange={setDateRange}
            toDate={new Date()}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full">
        {mappedDatas.map((mappedData) => (
          <LLMUsageCard {...mappedData}></LLMUsageCard>
        ))}
      </div>
    </div>
  );
}
