import { Component, type ReactNode } from 'react'
import { ErrorState } from '@/components/ui/empty-state'

type BoundaryProps = {
  resetKey: string
  children: ReactNode
}

type BoundaryState = {
  error: Error | null
  resetKey: string
}

export class PageBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null, resetKey: '' }

  static getDerivedStateFromError(error: Error): Partial<BoundaryState> {
    return { error }
  }

  static getDerivedStateFromProps(props: BoundaryProps, state: BoundaryState): Partial<BoundaryState> | null {
    if (state.resetKey !== props.resetKey) return { error: null, resetKey: props.resetKey }
    return null
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-6xl">
          <ErrorState
            description="This screen hit a problem and was stopped so the rest of the app could stay open."
            onRetry={() => this.setState({ error: null })}
          />
        </div>
      )
    }
    return this.props.children
  }
}
