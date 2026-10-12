import { Check, Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type FieldProps = {
  label: string
  required?: boolean
  optional?: boolean
  error?: string | null
  valid?: boolean
  hint?: string
  children: ReactNode
}

export function Field({ label, required, optional, error, valid, hint, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
        {optional ? <span className="ml-1 font-normal text-muted-foreground">Optional</span> : null}
      </span>
      {children}
      {error ? (
        <span className="text-xs text-danger" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
      <span className="sr-only">{valid ? `${label} looks good` : ''}</span>
    </label>
  )
}

const controlClass =
  'w-full min-h-12 rounded-lg border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  required?: boolean
  optional?: boolean
  error?: string | null
  valid?: boolean
  hint?: string
  secret?: boolean
}

export function Input({ label, required, optional, error, valid, hint, secret, className, id, ...props }: TextFieldProps) {
  const [visible, setVisible] = useState(false)
  const inputId = id ?? props.name
  return (
    <Field label={label} required={required} optional={optional} error={error} valid={valid} hint={hint}>
      <span className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(controlClass, error ? 'border-danger pr-10' : valid ? 'border-success pr-10' : 'border-border', className)}
          {...props}
          type={secret ? (visible ? 'text' : 'password') : props.type}
        />
        {secret ? (
          <button
            type="button"
            className="absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground"
            aria-label={visible ? `Hide ${label}` : `Show ${label}`}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : valid ? (
          <Check className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-success" size={18} aria-hidden />
        ) : null}
      </span>
    </Field>
  )
}

type AreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  required?: boolean
  optional?: boolean
  error?: string | null
  valid?: boolean
}

export function TextArea({ label, required, optional, error, valid, className, id, ...props }: AreaProps) {
  return (
    <Field label={label} required={required} optional={optional} error={error} valid={valid}>
      <textarea
        id={id ?? props.name}
        aria-invalid={error ? true : undefined}
        className={cn(controlClass, 'min-h-28 py-3', error ? 'border-danger' : valid ? 'border-success' : 'border-border', className)}
        {...props}
      />
    </Field>
  )
}

type MoneyProps = {
  label: string
  required?: boolean
  optional?: boolean
  value: string
  onChange: (value: string) => void
  error?: string | null
  valid?: boolean
  name?: string
}

export function MoneyField({ label, required, optional, value, onChange, error, valid, name }: MoneyProps) {
  return (
    <Field label={label} required={required} optional={optional} error={error} valid={valid}>
      <span className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-muted-foreground">₹</span>
        <input
          name={name}
          inputMode="numeric"
          aria-invalid={error ? true : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/[^\d,]/g, ''))}
          className={cn(controlClass, 'pl-8', error ? 'border-danger pr-10' : valid ? 'border-success pr-10' : 'border-border')}
        />
        {valid ? <Check className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-success" size={18} /> : null}
      </span>
    </Field>
  )
}

type DateProps = {
  label: string
  required?: boolean
  optional?: boolean
  value: string
  onChange: (value: string) => void
  error?: string | null
  valid?: boolean
  name?: string
}

export function DateField({ label, required, optional, value, onChange, error, valid, name }: DateProps) {
  return (
    <Field label={label} required={required} optional={optional} error={error} valid={valid}>
      <input
        type="date"
        name={name}
        value={value}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn(controlClass, error ? 'border-danger' : valid ? 'border-success' : 'border-border')}
      />
    </Field>
  )
}
