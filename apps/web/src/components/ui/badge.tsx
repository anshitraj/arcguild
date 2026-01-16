import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'destructive'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        {
          'bg-accent/20 text-accent border border-accent/30': variant === 'default',
          'bg-secondary text-secondary-foreground border border-border': variant === 'secondary',
          'bg-green-500/20 text-green-400 border border-green-500/30': variant === 'success',
          'bg-red-500/20 text-red-400 border border-red-500/30': variant === 'destructive',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
