import { DateRange, DateRangePicker } from "@/components/ui/DatePicker";
import { Card } from "@/components/ui/Card";
import { createFileRoute } from "@tanstack/react-router";
import { DATE_PICKER_RANGE_PRESETS as presets } from "@/lib/constants";
import React, { useEffect, useMemo } from "react";
import {
  fetchLLMUsages,
  LLMUsageResponse,
  mapUsageForUI,
} from "@/repo/usage.repo";
import { useQuery } from "@tanstack/react-query";
import { FixedSizeList as List } from "react-window";

// @ts-expect-error no types
import { prettyDigits } from "prettydigits";
import { LLMUsageCard } from "@/components/LLMUsageCard";

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

  const [LLMUsages, setLLMUsages] = React.useState<LLMUsageResponse[]>([]);

  useEffect(() => {
    if (
      data === undefined ||
      dateRange?.from === undefined ||
      dateRange.to === undefined
    ) {
      setLLMUsages([]);
      return;
    }

    setLLMUsages(data.usages);
  }, [data, dateRange?.from, dateRange?.to]);

  const mappedDatas = useMemo(() => {
    if (dateRange?.from === undefined || dateRange.to === undefined) return [];

    return mapUsageForUI(LLMUsages, dateRange.from, dateRange.to);
  }, [LLMUsages, dateRange?.from, dateRange?.to]);

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  // react-window implementation here still using harcoded width and height
  // see issue here: https://github.com/bvaughn/react-window/issues/446
  // due to my limited UI knowledge, I will leave this as my future problem
  // people would likely spin this app in PC with wide screen anyway
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
        <List
          className="List"
          height={800}
          itemData={mappedDatas}
          itemCount={mappedDatas.length}
          itemSize={400}
          width={1600}
        >
          {LLMUsageCard}
        </List>
      </div>
    </div>
  );
}
