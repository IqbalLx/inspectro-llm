import { Card } from "@/components/ui/Card";
import { capitalizeFirstLetter } from "@/lib/utils";
import { LLMUsageDataUI, LLMUsageUI } from "@/repo/usage.repo";
import {
  ComboChart,
  TooltipProps as ComboChartTooltipProps,
} from "./ui/ComboChart";

// @ts-expect-error no types
import { prettyDigits } from "prettydigits";
import { BarChart, TooltipProps as BarChartTooltipProps } from "./ui/BarChart";

import { ListChildComponentProps } from "react-window";

const categoriesMap = {
  input_token_cost: "Input Cost",
  output_token_cost: "Output Cost",
  total_token: "Token",
  request_count: "Request Count",
};

const categoriesClassMap = {
  input_token_cost: "h-2.5 w-2.5 rounded-sm bg-blue-500",
  output_token_cost: "h-2.5 w-2.5 rounded-sm bg-green-500",
  total_token: "h-1 w-4 rounded-full bg-pink-500",
  request_count: "h-2.5 w-2.5 rounded-sm bg-blue-500",
};

const Tooltip = (
  data: LLMUsageDataUI,
  categoriesToShow: (keyof typeof categoriesMap)[],
  label: string
) => {
  return (
    <div className="w-56 rounded-md border bg-white/5 p-3 text-sm shadow-sm backdrop-blur-md dark:border-gray-800 dark:bg-black/5">
      <p className="mb-2 font-medium text-gray-900 dark:text-gray-50">
        {label}
      </p>
      <div className="flex flex-col space-y-2">
        {categoriesToShow.map((category) => (
          <div key={category} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={categoriesClassMap[category]} />
              <p className="text-gray-700 dark:text-gray-400">
                {categoriesMap[category]}
              </p>
            </div>
            <p className="font-medium tabular-nums text-gray-900 dark:text-gray-50">
              {category === "input_token_cost" ||
              category === "output_token_cost"
                ? `$${prettyDigits(data[category])}`
                : data[category]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ComboChartTooltip = (props: ComboChartTooltipProps) => {
  const { payload, active, label } = props;
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;

  const categoriesToShow = [
    "input_token_cost",
    "output_token_cost",
    "total_token",
  ] as (keyof typeof categoriesMap)[];

  return Tooltip(data, categoriesToShow, label);
};

const BarChartTooltip = ({ payload, active, label }: BarChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;

  const categoriesToShow = ["request_count"] as (keyof typeof categoriesMap)[];

  return Tooltip(data, categoriesToShow, label);
};

export const LLMUsageCard = ({
  data,
  index,
  style,
}: ListChildComponentProps<LLMUsageUI[]>) => {
  console.log(data);
  if (data === undefined) return;

  const llmUsage = data[index];
  const llmName = capitalizeFirstLetter(llmUsage.provider);

  return (
    <div style={style}>
      <Card className="flex flex-col items-center gap-y-8">
        <h2 className="font-semibold text-gray-900 dark:text-gray-50">
          {llmUsage.model_name} — {llmName}
        </h2>
        <div className="w-full flex flex-row gap-8">
          <BarChart
            className="hidden h-72 sm:block"
            key={llmUsage.model_name}
            data={llmUsage.usagesUI}
            index="date"
            categories={["request_count"]}
            showLegend={false}
            customTooltip={BarChartTooltip}
          />
          <ComboChart
            className="hidden h-72 sm:block"
            data={llmUsage.usagesUI}
            index="date"
            enableBiaxial={true}
            barSeries={{
              type: "stacked",
              colors: ["blue", "emerald"],
              categories: ["input_token_cost", "output_token_cost"],
              yAxisWidth: 60,
            }}
            lineSeries={{
              colors: ["pink"],
              categories: ["total_token"],
            }}
            customTooltip={ComboChartTooltip}
            showLegend={false}
          />
        </div>
      </Card>
    </div>
  );
};
