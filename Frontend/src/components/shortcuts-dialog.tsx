import { Modal } from '@/components/ui/modal'

const shortcuts = [
  ['Ctrl K or ⌘K', 'Open the command menu'],
  ['Ctrl B or ⌘B', 'Collapse or expand the sidebar'],
  ['?', 'Show this cheat sheet'],
  ['N', 'New employee, from the employee list'],
  ['Esc', 'Close a dialog, drawer, or menu'],
]

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts">
      <ul className="mt-2 divide-y divide-border">
        {shortcuts.map(([keys, description]) => (
          <li key={keys} className="flex items-center justify-between gap-4 py-3 text-sm">
            <span>{description}</span>
            <kbd className="shrink-0 rounded-md border border-border bg-muted px-2 py-1 text-xs">{keys}</kbd>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
