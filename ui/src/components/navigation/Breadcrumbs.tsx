import { ChevronRight } from "lucide-react"
import { Link, useRouterState } from '@tanstack/react-router'

export function Breadcrumbs() {
  const matches = useRouterState({ select: (s) => s.matches })

  const breadcrumbs = matches
    .filter((match) => match.context.getTitle)
    .map(({ pathname, context }) => {
      return {
        title: context.getTitle(),
        path: pathname,
      }
    })
    
  breadcrumbs.shift()

  return (
    <>
      <nav aria-label="Breadcrumb" className="ml-2">
        <ol role="list" className="flex items-center space-x-3 text-sm">
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            
            if (isLast) {
              return (
                <li className="flex" key={breadcrumb.path}>
                  <Link to={breadcrumb.path}>{breadcrumb.title}</Link>
                </li>
              )
            }

            return (
              <>
                <li className="flex" key={breadcrumb.path}>
                  <Link to={breadcrumb.path}>{breadcrumb.title}</Link>
                </li>

                <ChevronRight
                  className="size-4 shrink-0 text-gray-600 dark:text-gray-400"
                  aria-hidden="true"
                />
              </>
            )
          })}
        </ol>
      </nav>
    </>
  )
}


