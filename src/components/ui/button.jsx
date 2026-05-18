import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:opacity-90 active:scale-[0.98]',
        secondary:
          'bg-secondary text-secondary-foreground shadow hover:opacity-90 active:scale-[0.98]',
        outline:
          'border border-white/40 bg-transparent text-white hover:bg-white/10 hover:border-white/70',
        ghost:
          'hover:bg-accent hover:text-accent-foreground',
        white:
          'bg-white text-primary shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0',
        'white-outline':
          'border border-white/40 bg-transparent text-white/80 hover:bg-white/8 hover:text-white transition-colors',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm:      'h-8 px-4 text-xs',
        lg:      'h-12 px-8 text-base font-bold',
        xl:      'h-14 px-10 text-lg font-bold',
        icon:    'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }
