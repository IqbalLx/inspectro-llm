import { LLM } from "@/repo/llm.repo";
import {
  Table,
  TableRoot,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";
import { capitalizeFirstLetter } from "@/lib/utils";

export const LLMTable = (llm: LLM) => {
  const llmName = capitalizeFirstLetter(llm.name);

  return (
    <Card className="flex flex-col items-center">
      <div className="flex gap-x-2 items-center">
        <h2 className="font-semibold text-gray-900 dark:text-gray-50">
          {llmName}
        </h2>
        <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
          ({llm.apiBase})
        </p>
      </div>
      <div className="w-full">
        <TableRoot>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Model Name</TableHeaderCell>
                <TableHeaderCell>Cost Per Million Input</TableHeaderCell>
                <TableHeaderCell>Cost Per Million Output</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {llm.models.map((model) => (
                <TableRow key={model.name}>
                  <TableCell>{model.name}</TableCell>
                  <TableCell>${model.costPerMillionInputToken ?? 0}</TableCell>
                  <TableCell>${model.costPerMillionOutputToken ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableRoot>
      </div>
    </Card>
  );
};
