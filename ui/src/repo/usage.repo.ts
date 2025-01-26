import {
  dateToUnix,
  formatDate,
  formatDateStr,
  getDateRange,
  wrapEndDate,
  wrapStartDate,
} from "@/lib/utils";

export type LLMUsage = {
  provider: string;
  model_name: string;
  input_token: number;
  output_token: number;
  total_token: number;
  input_token_cost: number;
  output_token_cost: number;
  total_token_cost: number;
  ts: string;
};

export type Spending = {
  money: number;
  token: number;
};

export type LLMUsageResponse = {
  provider: string;
  model_name: string;
  usages: LLMUsage[];
};

export type UsageResponse = {
  all_time_spending: Spending;
  current_spending: Spending;
  usages: LLMUsageResponse[];
};

export const fetchLLMUsages = async (
  startTS?: Date,
  endTS?: Date
): Promise<UsageResponse | undefined> => {
  const emptyData = {
    all_time_spending: { money: 0, token: 0 },
    current_spending: { money: 0, token: 0 },
    usages: [],
  };

  if (startTS === undefined || endTS === undefined) return emptyData;

  const startTSUnix = dateToUnix(wrapStartDate(startTS));
  const endTSUnix = dateToUnix(wrapEndDate(endTS));
  const resp = await fetch(
    `/api/usage?startTS=${startTSUnix}&endTS=${endTSUnix}`
  );
  if (resp.status === 204) return emptyData;

  return await resp.json();
};

// viz helper

export type LLMUsageUI = {
  model_name: string;
  provider: string;
  usagesUI: LLMUsageDataUI[];
};

export type LLMUsageDataUI = {
  date: string;
  input_token: number;
  output_token: number;
  total_token: number;
  input_token_cost: number;
  output_token_cost: number;
  total_token_cost: number;
  request_count: number;
};

export function mapUsageForUI(
  responses: LLMUsageResponse[],
  startDate: Date,
  endDate: Date
): LLMUsageUI[] {
  const map = new Map<string, LLMUsageDataUI[]>(); // model_name -> data

  const dateRange = getDateRange(startDate, endDate);

  responses.forEach((response) => {
    const usagePerDayMap = new Map<
      string,
      LLMUsage & { request_count: number }
    >(); // string date -> usage

    response.usages.forEach((usage) => {
      const dateKey = formatDateStr(usage.ts);

      if (usagePerDayMap.has(dateKey)) {
        const existing = usagePerDayMap.get(dateKey);

        existing!.input_token += usage.input_token;
        existing!.output_token += usage.output_token;
        existing!.total_token += usage.total_token;
        existing!.input_token_cost += usage.input_token_cost;
        existing!.output_token_cost += usage.output_token_cost;
        existing!.total_token_cost += usage.total_token_cost;
        existing!.request_count += 1;

        usagePerDayMap.set(dateKey, existing!);
        return;
      }

      usagePerDayMap.set(dateKey, { ...usage, request_count: 1 });
    });

    const dataPerSpanDatetime = dateRange.map((date) => {
      const formattedDate = formatDate(date);
      const value = usagePerDayMap.get(formattedDate) ?? {
        input_token: 0,
        output_token: 0,
        total_token: 0,
        input_token_cost: 0,
        output_token_cost: 0,
        total_token_cost: 0,
        request_count: 0,
      };

      return {
        ...value,
        date: formattedDate,
      };
    });

    map.set(`${response.model_name}_${response.provider}`, dataPerSpanDatetime);
  });

  return responses
    .map((response) => {
      return {
        model_name: response.model_name,
        provider: response.provider,
        usagesUI: map.get(`${response.model_name}_${response.provider}`)!,
      };
    })
    .sort((a, b) => {
      const aKey = `${a.model_name}_${a.provider}`;
      const bKey = `${b.model_name}_${b.provider}`;

      return aKey.localeCompare(bKey);
    });
}
