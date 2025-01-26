import { queryOptions } from "@tanstack/react-query";

export type LLM = {
  name: string;
  apiBase: string;
  models: {
    name: string;
    costPerMillionInputToken?: string;
    costPerMillionOutputToken?: string;
  }[];
};

export const fetchLLMS = async (): Promise<LLM[]> => {
  const resp = await fetch("/api/llm");
  const json: LLM[] = await resp.json();
  return json.sort((a, b) => a.name.localeCompare(b.name));
};

export const llmQueryOptions = queryOptions({
  queryKey: ["llm"],
  queryFn: fetchLLMS,
  refetchInterval: 1000 * 5, // seconds
  gcTime: 0,
});
