"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarLink,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/Sidebar";
import { Activity, Bot } from "lucide-react";
import * as React from "react";
import { useRouterState } from "@tanstack/react-router";

const navigation = [
  {
    name: "Usage",
    href: "/usage",
    icon: Activity,
    notifications: false,
    active: false,
  },
  {
    name: "LLM Model",
    href: "/llm-model",
    icon: Bot,
    notifications: false,
    active: false,
  },
] as const;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouterState();

  return (
    <Sidebar {...props} className="bg-gray-50 dark:bg-gray-925">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3">
          <div>
            <span className="block text-sm font-semibold text-gray-900 dark:text-gray-50">
              InspectroLLM
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarLink
                    href={item.href}
                    isActive={router.location.pathname === item.href}
                    icon={item.icon}
                    notifications={item.notifications}
                  >
                    {item.name}
                  </SidebarLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="border-t border-gray-200 dark:border-gray-800" />
      </SidebarFooter>
    </Sidebar>
  );
}
