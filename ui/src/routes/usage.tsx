import { DateRange, DateRangePicker } from "@/components/ui/DatePicker";
import { Card } from "@/components/ui/Card";
import { LLMUsageCard } from "@/components/LLMUsageCard";
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
import { DollarSign, SquareCode } from "lucide-react";

// @ts-expect-error no types
import { prettyDigits } from "prettydigits";
import { SizeMe } from "react-sizeme";
import { Input } from "@/components/ui/Input";

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

  const [searchQuery, setSearchQuery] = React.useState<string | undefined>(
    undefined
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState<
    string | undefined
  >(undefined);

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["usage", dateRange, debouncedSearchQuery],
    queryFn: () =>
      fetchLLMUsages(dateRange?.from, dateRange?.to, debouncedSearchQuery),
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="flex flex-col items-start w-full m-4 gap-4 pr-8">
      <div className="flex flex-col w-full">
        <div className="flex flex-row gap-4 grow justify-start items-start w-full flex-wrap">
          <Card className="w-1/5">
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-gray-900 dark:text-gray-50">
                Total Spending
              </p>
              <DollarSign className="size-[18px] shrink-0 text-gray-500" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              ${prettyDigits(data?.all_time_spending.money ?? 0)}
            </p>
          </Card>
          <Card className="w-1/5">
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-gray-900 dark:text-gray-50">
                Current Spending
              </p>
              <DollarSign className="size-[18px] shrink-0 text-gray-500" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              ${prettyDigits(data?.current_spending.money ?? 0)}
            </p>
          </Card>
          <Card className="w-1/5">
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-gray-900 dark:text-gray-50">
                Total Tokens
              </p>
              <SquareCode className="size-[18px] shrink-0 text-gray-500" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {prettyDigits(data?.all_time_spending.token ?? 0)}
            </p>
          </Card>
          <Card className="w-1/5">
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-gray-900 dark:text-gray-50">
                Current Tokens
              </p>
              <SquareCode className="size-[18px] shrink-0 text-gray-500" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {prettyDigits(data?.current_spending.token ?? 0)}
            </p>
          </Card>
        </div>

        <div className="mt-4 w-full">
          <div className="flex flex-row items-center justify-start gap-4">
            <Input
              placeholder="Search LLM"
              id="search"
              name="search"
              type="search"
              className="w-96"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />

            <DateRangePicker
              presets={presets}
              value={dateRange}
              onChange={setDateRange}
              toDate={new Date()}
              className="w-80"
            />
          </div>
        </div>
      </div>

      {isPending && <span>Loading...</span>}
      {isError && <span>Error: {error.message}</span>}

      {!isError && (
        <SizeMe>
          {({ size }) => {
            return (
              <div className="flex flex-col gap-4 w-full">
                <List
                  className="List"
                  height={800}
                  itemData={mappedDatas}
                  itemCount={mappedDatas.length}
                  itemSize={400}
                  width={size.width ?? 0}
                >
                  {LLMUsageCard}
                </List>
              </div>
            );
          }}
        </SizeMe>
      )}
    </div>
  );
}
