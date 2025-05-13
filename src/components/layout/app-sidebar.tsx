
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Workflow, MessageSquareText, BookOpen, ChevronsUpDown, Settings } from 'lucide-react'; // Added Settings icon
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from '@/lib/utils';
import React from 'react';

const guideSections = [
  { href: '/guide/intro', label: "1. Qu'est-ce que BPMN 2.0 ?" },
  {
    label: '2. Concepts Clés',
    basePath: '/guide/concepts',
    subItems: [
      { href: '/guide/flow-objects', label: '2.1 Objets de Flux' },
      { href: '/guide/connecting-objects', label: '2.2 Objets de Connexion' },
      { href: '/guide/swimlanes', label: '2.3 Couloirs' },
      { href: '/guide/artifacts', label: '2.4 Artefacts' },
    ],
  },
  { href: '/guide/diagram-types', label: '3. Types de Diagrammes' },
  { href: '/guide/best-practices', label: '4. Bonnes Pratiques' },
  { href: '/guide/interoperability', label: '5. Interopérabilité' },
  { href: '/guide/execution-semantics', label: '6. Sémantique d\'Exécution' },
  { href: '/guide/ai-instructions', label: "7. Instructions pour l'IA" },
];

const SidebarAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {isActive?: boolean}
>(({ className, children, isActive, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        className
      )}
      {...props}
    >
      {children}
      <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-sidebar-foreground/70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
SidebarAccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const SidebarAccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-1 pt-0 pl-4", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
SidebarAccordionContent.displayName = AccordionPrimitive.Content.displayName;


export default function AppSidebar() {
  const pathname = usePathname();

  const isLinkActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };
  
  const conceptsKeyBase = guideSections.find(s => s.label === '2. Concepts Clés')?.subItems?.map(sub => sub.href);
  const defaultAccordionValue = conceptsKeyBase?.some(href => isLinkActive(href)) ? "concepts-cles" : undefined;


  return (
    <Sidebar className="border-r" collapsible="icon" side="left">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <Workflow className="h-7 w-7 text-sidebar-primary" />
          <h2 className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            BPMN Guide
          </h2>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <ScrollArea className="h-full">
          <SidebarMenu>
            <AccordionPrimitive.Root type="single" collapsible defaultValue={defaultAccordionValue}>
              {guideSections.map((section) =>
                section.subItems ? (
                  <AccordionPrimitive.Item value={section.label.toLowerCase().replace(/\s+/g, '-')} key={section.label} className="border-b-0">
                     <SidebarAccordionTrigger isActive={section.basePath ? isLinkActive(section.basePath) : section.subItems.some(sub => isLinkActive(sub.href))}>
                      <BookOpen className="h-4 w-4 text-sidebar-primary" />
                      <span className="group-data-[collapsible=icon]:hidden">{section.label}</span>
                    </SidebarAccordionTrigger>
                    <SidebarAccordionContent>
                      <SidebarMenuSub>
                        {section.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.href}>
                            <Link href={subItem.href} legacyBehavior passHref>
                              <SidebarMenuSubButton
                                isActive={isLinkActive(subItem.href, true)}
                                className="group-data-[collapsible=icon]:hidden"
                              >
                                {subItem.label}
                              </SidebarMenuSubButton>
                            </Link>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </SidebarAccordionContent>
                  </AccordionPrimitive.Item>
                ) : (
                  <SidebarMenuItem key={section.href}>
                    <Link href={section.href!} legacyBehavior passHref>
                      <SidebarMenuButton isActive={isLinkActive(section.href!, true)} tooltip={{children: section.label}}>
                        <BookOpen className="h-4 w-4 text-sidebar-primary" />
                        <span className="group-data-[collapsible=icon]:hidden">{section.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )
              )}
            </AccordionPrimitive.Root>
            <SidebarMenuItem>
              <Link href="/chat" legacyBehavior passHref>
                <SidebarMenuButton isActive={isLinkActive('/chat')} tooltip={{children: "Chat Génération XML"}}>
                  <MessageSquareText className="h-4 w-4 text-sidebar-primary" />
                  <span className="group-data-[collapsible=icon]:hidden">Chat Génération XML</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/system-prompt" legacyBehavior passHref>
                <SidebarMenuButton isActive={isLinkActive('/admin/system-prompt')} tooltip={{children: "Éditeur Prompt IA"}}>
                  <Settings className="h-4 w-4 text-sidebar-primary" />
                  <span className="group-data-[collapsible=icon]:hidden">Éditeur Prompt IA</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
