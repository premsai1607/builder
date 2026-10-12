import * as Dialog from '@radix-ui/react-dialog'
import { motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export function EntityDrawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md outline-none">
          <motion.div
            className="flex h-full w-full flex-col border-l border-border bg-card shadow-popover"
            initial={reduce ? false : { x: 28, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
              <Dialog.Close className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted" aria-label="Close details">
                <X size={18} />
              </Dialog.Close>
            </div>
            <div className="flex-1 overflow-auto px-5 py-5">{children}</div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export const DetailDrawer = EntityDrawer

export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-border py-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="mt-1 text-sm">{value || '—'}</div>
    </div>
  )
}
