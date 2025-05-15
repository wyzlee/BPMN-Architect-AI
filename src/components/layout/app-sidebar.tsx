
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Workflow, MessageSquareText, Settings, FileEdit, ShieldCheck, Construction, Library, Settings2 } from 'lucide-react'; 
import React from 'react';

export default function AppSidebar() {
  const pathname = usePathname();

  const isLinkActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };
  
  return (
    <Sidebar className="border-r" collapsible="icon" side="left">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <Workflow className="h-7 w-7 text-sidebar-primary" />
          <h2 className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            BPMN AI
          </h2>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <ScrollArea className="h-full">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/chat" legacyBehavior passHref>
                <SidebarMenuButton isActive={isLinkActive('/chat')} tooltip={{children: "Chat Génération XML"}}>
                  <MessageSquareText className="h-4 w-4 text-sidebar-primary" />
                  <span className="group-data-[collapsible=icon]:hidden">Chat Génération XML</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/saved-bpmn" legacyBehavior passHref>
                <SidebarMenuButton isActive={isLinkActive('/saved-bpmn')} tooltip={{children: "BPMN Sauvegardés"}}>
                  <Library className="h-4 w-4 text-sidebar-primary" />
                  <span className="group-data-[collapsible=icon]:hidden">BPMN Sauvegardés</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/llm-settings" legacyBehavior passHref>
                <SidebarMenuButton isActive={isLinkActive('/admin/llm-settings')} tooltip={{children: "Configuration LLM"}}>
                  <Settings2 className="h-4 w-4 text-sidebar-primary" />
                  <span className="group-data-[collapsible=icon]:hidden">Configuration LLM</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/admin/refinement-prompt" legacyBehavior passHref>
                <SidebarMenuButton isActive={isLinkActive('/admin/refinement-prompt')} tooltip={{children: "Éditeur Prompt Raffinement"}}>
                  <FileEdit className="h-4 w-4 text-sidebar-primary" />
                  <span className="group-data-[collapsible=icon]:hidden">Éditeur Prompt Raffinement</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/system-prompt" legacyBehavior passHref>
                <SidebarMenuButton isActive={isLinkActive('/admin/system-prompt')} tooltip={{children: "Éditeur Prompt Génération"}}>
                  <Settings className="h-4 w-4 text-sidebar-primary" />
                  <span className="group-data-[collapsible=icon]:hidden">Éditeur Prompt Génération</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/validation-prompt" legacyBehavior passHref>
                <SidebarMenuButton isActive={isLinkActive('/admin/validation-prompt')} tooltip={{children: "Éditeur Prompt Validation"}}>
                  <ShieldCheck className="h-4 w-4 text-sidebar-primary" />
                  <span className="group-data-[collapsible=icon]:hidden">Éditeur Prompt Validation</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/correction-prompt" legacyBehavior passHref>
                <SidebarMenuButton isActive={isLinkActive('/admin/correction-prompt')} tooltip={{children: "Éditeur Prompt Correction"}}>
                  <Construction className="h-4 w-4 text-sidebar-primary" />
                  <span className="group-data-[collapsible=icon]:hidden">Éditeur Prompt Correction</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
