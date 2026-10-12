import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ErrorState, PageFrame } from '@/components/ui/empty-state'
import { DateField, Input, MoneyField, TextArea } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useData } from '@/context/DataContext'
import { formatNumber, parseDigits } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ProjectStatus, ProjectType } from '@/types'

type Draft = {
  type: ProjectType
  name: string
  about: string
  status: ProjectStatus | ''
  budget: string
  price: string
  startDate: string
  address: string
  amenities: string[]
}

const emptyDraft: Draft = {
  type: 'client',
  name: '',
  about: '',
  status: 'Pending',
  budget: '',
  price: '',
  startDate: '',
  address: '',
  amenities: [],
}

export function ProjectForm() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const { projects, amenities, addAmenity, addProject, updateProject } = useData()
  const existing = projects.find((project) => project.id === id)
  const [draft, setDraft] = useState<Draft>(() => (existing ? toDraft(existing) : emptyDraft))
  const [touched, setTouched] = useState(false)
  const [adding, setAdding] = useState(false)
  const [amenityDraft, setAmenityDraft] = useState('')

  useEffect(() => {
    const match = projects.find((project) => project.id === id)
    setDraft(match ? toDraft(match) : emptyDraft)
    setTouched(false)
  }, [id, projects])

  if (!isNew && !existing) {
    return (
      <PageFrame>
        <ErrorState title="Project not found" description="This project is not in the workspace." onRetry={() => navigate('/projects')} />
      </PageFrame>
    )
  }

  const budgetValue = parseDigits(draft.budget) ?? 0
  const priceValue = parseDigits(draft.price) ?? 0
  const errors = {
    name: draft.name.trim().length < 2 ? 'Enter the project name.' : '',
    about: draft.about.trim().length < 2 ? 'Describe what this project is about.' : '',
    status: draft.status ? '' : 'Choose a status.',
    budget: budgetValue > 0 ? '' : 'Enter an expected budget greater than 0.',
    price: priceValue > 0 ? '' : 'Enter a price per sq ft greater than 0.',
    startDate: draft.startDate ? '' : 'Choose an expected start date.',
    address: draft.address.trim().length < 3 ? 'Enter the project address.' : '',
  }
  const show = (field: keyof typeof errors) => (touched ? errors[field] : null)

  function save() {
    setTouched(true)
    if (Object.values(errors).some(Boolean) || !draft.status) return
    const payload = {
      type: draft.type,
      name: draft.name.trim(),
      about: draft.about.trim(),
      status: draft.status,
      expectedBudget: budgetValue,
      pricePerSqft: priceValue,
      startDate: draft.startDate,
      address: draft.address.trim(),
      amenities: draft.amenities,
    }
    if (existing) updateProject(existing.id, payload)
    else addProject(payload)
    toast.success(existing ? 'Project updated' : 'Project saved')
    navigate('/projects')
  }

  function addChip() {
    const label = amenityDraft.trim()
    if (label.length < 2) return
    addAmenity(label)
    setDraft((current) => ({ ...current, amenities: current.amenities.includes(label) ? current.amenities : [...current.amenities, label] }))
    setAmenityDraft('')
    setAdding(false)
  }

  return (
    <PageFrame>
      <div className="rounded-xl bg-card p-4 border border-border shadow-card sm:p-6">
        <h1 className="text-xl font-semibold">{existing ? 'Edit project' : 'New project'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Amenities are optional. Everything else is needed before the project can be saved.</p>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <fieldset className="md:col-span-2">
            <legend className="mb-2 text-sm font-medium">
              Project type <span className="text-danger">*</span>
            </legend>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(['internal', 'client'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={draft.type === type}
                  className={cn('min-h-12 rounded-md text-sm font-semibold capitalize', draft.type === type ? 'bg-card text-foreground shadow' : 'text-muted-foreground')}
                  onClick={() => setDraft({ ...draft, type })}
                >
                  {type}
                </button>
              ))}
            </div>
          </fieldset>
          <Input label="Project name" required name="name" value={draft.name} error={show('name')} valid={draft.name.trim().length >= 2} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          <Select
            label="Status"
            required
            value={draft.status}
            error={show('status')}
            valid={Boolean(draft.status)}
            options={['Pending', 'Active', 'In Progress', 'Completed', 'Cancelled'].map((item) => ({ value: item, label: item }))}
            onChange={(status) => setDraft({ ...draft, status: status as ProjectStatus })}
          />
          <div className="md:col-span-2">
            <TextArea label="About" required name="about" value={draft.about} error={show('about')} valid={draft.about.trim().length >= 2} onChange={(event) => setDraft({ ...draft, about: event.target.value })} />
          </div>
          <MoneyField label="Expected budget" required name="budget" value={draft.budget} error={show('budget')} valid={budgetValue > 0} onChange={(value) => setDraft({ ...draft, budget: parseDigits(value) ? formatNumber(parseDigits(value) ?? 0) : '' })} />
          <MoneyField label="Price per sq ft" required name="price" value={draft.price} error={show('price')} valid={priceValue > 0} onChange={(value) => setDraft({ ...draft, price: parseDigits(value) ? formatNumber(parseDigits(value) ?? 0) : '' })} />
          <DateField label="Expected start date" required name="startDate" value={draft.startDate} error={show('startDate')} valid={Boolean(draft.startDate)} onChange={(startDate) => setDraft({ ...draft, startDate })} />
          <Input label="Project address" required name="address" value={draft.address} error={show('address')} valid={draft.address.trim().length >= 3} onChange={(event) => setDraft({ ...draft, address: event.target.value })} />
          <fieldset className="md:col-span-2">
            <legend className="text-sm font-medium">
              Amenities <span className="font-normal text-muted-foreground">Optional</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {amenities.map((item) => {
                const on = draft.amenities.includes(item)
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={on}
                    className={cn('min-h-12 rounded-full border px-4 text-sm font-medium', on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card')}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        amenities: on ? draft.amenities.filter((amenity) => amenity !== item) : [...draft.amenities, item],
                      })
                    }
                  >
                    {item}
                  </button>
                )
              })}
            </div>
            {adding ? (
              <div className="mt-3 flex gap-2">
                <input value={amenityDraft} onChange={(event) => setAmenityDraft(event.target.value)} aria-label="New amenity" placeholder="New amenity" className="min-h-12 flex-1 rounded-lg border border-border px-3 text-sm" />
                <Button onClick={addChip}>Add</Button>
              </div>
            ) : (
              <button type="button" className="mt-3 min-h-12 text-sm font-semibold text-primary-dark" onClick={() => setAdding(true)}>
                + Add new
              </button>
            )}
          </fieldset>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/projects')}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={save}>
            Save project
          </Button>
        </div>
      </div>
    </PageFrame>
  )
}

function toDraft(project: { type: ProjectType; name: string; about: string; status: ProjectStatus; expectedBudget: number; pricePerSqft: number; startDate: string; address: string; amenities: string[] }): Draft {
  return {
    type: project.type,
    name: project.name,
    about: project.about,
    status: project.status,
    budget: formatNumber(project.expectedBudget),
    price: formatNumber(project.pricePerSqft),
    startDate: project.startDate,
    address: project.address,
    amenities: project.amenities,
  }
}
