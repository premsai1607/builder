import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-[background-color,transform,box-shadow] duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-orange-600',
        secondary: 'border border-border bg-card text-foreground hover:bg-muted',
        ghost: 'bg-transparent text-foreground hover:bg-muted',
        danger: 'bg-danger-solid text-white hover:brightness-95',
      },
      size: {
        md: 'min-h-12 px-4',
        sm: 'min-h-12 px-3 lg:min-h-10',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export function Button({ className, variant, size, asChild = false, type = 'button', ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...(asChild ? props : { ...props, type })} />
}

export { buttonVariants }
