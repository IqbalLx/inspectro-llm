import { AppSidebar } from "@/components/navigation/AppSidebar";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/Sidebar";
import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";

interface RouterContext {
  queryClient: QueryClient;
  getTitle: () => string;
}

const queryClient = new QueryClient();
export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    return (
      <>
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <div className="w-full mr-8">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
              <SidebarTrigger className="-ml-1" />
              <div className="mr-2 h-4 w-px bg-gray-200 dark:bg-gray-800" />
              <Breadcrumbs />
            </header>
            <main>
              <QueryClientProvider client={queryClient}>
                <Outlet />
              </QueryClientProvider>
            </main>
          </div>
        </SidebarProvider>
      </>
    );
  },
});
