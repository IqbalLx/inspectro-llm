import { LLMTable } from '@/components/LLMTable'
import { llmQueryOptions } from '@/repo/llm.repo'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/llm-model/')({
  component: LLMModel,
  beforeLoad: () => {
    return {
      getTitle: () => 'LLM Model',
    }
  },
})

function LLMModel() {
  const { isPending, isError, data, error } = useQuery(llmQueryOptions)

  if (isPending) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  return (
    <div className="p-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
      {data.map((llm) => (
        <LLMTable {...llm} />
      ))}
    </div>
  )
}
