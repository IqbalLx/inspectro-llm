import { Usage } from './usage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Usage,
  beforeLoad: () => {
    return {
      getTitle: () => 'Usage',
    }
  },
})
