import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'

export function BottomSheet({
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
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-auto rounded-t-2xl bg-card px-4 pt-3 pb-8 shadow-popover">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
          <Dialog.Title className="mb-4 text-lg font-semibold">{title}</Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
