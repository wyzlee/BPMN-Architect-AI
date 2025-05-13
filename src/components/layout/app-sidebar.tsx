
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
import { Workflow, MessageSquareText, Settings, FileEdit } from 'lucide-react'; 
import React from 'react';

// Guide sections are kept here for potential future use, but not rendered in the sidebar
// const guideSections = [
//   { href: '/guide/intro', label: "1. Qu'est-ce que BPMN 2.0 ?" },
//   {
//     label: '2. Concepts Clés',
//     basePath: '/guide/concepts',
//     subItems: [
//       { href: '/guide/flow-objects', label: '2.1 Objets de Flux' },
//       { href: '/guide/connecting-objects', label: '2.2 Objets de Connexion' },
//       { href: '/guide/swimlanes', label: '2.3 Couloirs' },
//       { href: '/guide/artifacts', label: '2.4 Artefacts' },
//     ],
//   },
//   { href: '/guide/diagram-types', label: '3. Types de Diagrammes' },
//   { href: '/guide/best-practices', label: '4. Bonnes Pratiques' },
//   { href: '/guide/interoperability', label: '5. Interopérabilité' },
//   { href: '/guide/execution-semantics', label: '6. Sémantique d\'Exécution' },
//   { href: '/guide/ai-instructions', label: "7. Instructions pour l'IA" },
// ];


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
            {/* Removed the guide sections loop and accordion */}
            <SidebarMenuItem>
              <Link href="/chat" legacyBehavior passHref>
                <SidebarMenuButton isActive={isLinkActive('/chat')} tooltip={{children: "Chat Génération XML"}}>
                  <MessageSquareText className="h-4 w-4 text-sidebar-primary" />
                  <span className="group-data-[collapsible=icon]:hidden">Chat Génération XML</span>
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
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}

