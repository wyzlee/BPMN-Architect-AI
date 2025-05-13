import { cn } from '@/lib/utils';

interface BpmnIconProps extends React.HTMLAttributes<HTMLDivElement> {
  svgString: string;
}

export function BpmnIcon({ svgString, className, ...props }: BpmnIconProps) {
  return (
    <div
      className={cn("inline-block leading-none", className)}
      dangerouslySetInnerHTML={{ __html: svgString }}
      {...props}
    />
  );
}
