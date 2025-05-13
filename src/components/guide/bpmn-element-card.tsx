"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BpmnIcon } from "@/components/bpmn/bpmn-icon";
import { bpmnData, type BpmnElementKey } from "@/lib/content/bpmn-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BpmnElementCardProps {
  elementName: BpmnElementKey;
}

export function BpmnElementCard({ elementName }: BpmnElementCardProps) {
  const element = bpmnData[elementName];

  if (!element) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Élément non trouvé</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{elementName}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
          <CardHeader className="flex flex-row items-center space-x-4 pb-2">
            <BpmnIcon svgString={element.svg} className="w-8 h-8 text-primary flex-shrink-0" />
            <CardTitle className="text-lg text-accent">{elementName}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {element.description}
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center space-x-4 mb-4">
            <BpmnIcon svgString={element.svg} className="w-16 h-16 text-primary flex-shrink-0" />
            <DialogTitle className="text-2xl">{elementName}</DialogTitle>
          </div>
        </DialogHeader>
        <DialogDescription className="text-base leading-relaxed">
          {element.description}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
