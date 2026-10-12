import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

export type SavedView = {
  id: string
  name: string
  department: string
  status: string
  builtIn?: boolean
}

type UiState = {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  favorites: string[]
  toggleFavorite: (id: string) => void
  recent: string[]
  pushRecent: (id: string) => void
  recentDepartments: string[]
  recentDesignations: string[]
  pushRecentLabel: (kind: 'department' | 'designation', label: string) => void
  views: SavedView[]
  saveView: (view: SavedView) => void
  removeView: (id: string) => void
  reorderViews: (views: SavedView[]) => void
  commandOpen: boolean
  setCommandOpen: (open: boolean) => void
  shortcutsOpen: boolean
  setShortcutsOpen: (open: boolean) => void
}

const builtInViews: SavedView[] = [
  { id: 'all', name: 'All employees', department: 'all', status: 'all', builtIn: true },
  { id: 'active', name: 'Active', department: 'all', status: 'Active', builtIn: true },
  { id: 'pending', name: 'Pending joining', department: 'all', status: 'Pending', builtIn: true },
]

function pushUnique(list: string[], value: string) {
  return [value, ...list.filter((item) => item !== value)].slice(0, 5)
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      sidebarCollapsed: typeof localStorage !== 'undefined' && localStorage.getItem('buildpro.sidebar') === '1',
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      favorites: [],
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id) ? state.favorites.filter((item) => item !== id) : [id, ...state.favorites],
        })),
      recent: [],
      pushRecent: (id) => set((state) => ({ recent: pushUnique(state.recent, id) })),
      recentDepartments: [],
      recentDesignations: [],
      pushRecentLabel: (kind, label) =>
        set((state) =>
          kind === 'department'
            ? { recentDepartments: pushUnique(state.recentDepartments, label) }
            : { recentDesignations: pushUnique(state.recentDesignations, label) },
        ),
      views: builtInViews,
      saveView: (view) => set((state) => ({ views: [...state.views.filter((item) => item.id !== view.id), view] })),
      removeView: (id) => set((state) => ({ views: state.views.filter((item) => item.id !== id || item.builtIn) })),
      reorderViews: (views) => set({ views }),
      commandOpen: false,
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      shortcutsOpen: false,
      setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),
    }),
    {
      name: 'buildpro.ui',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        favorites: state.favorites,
        recent: state.recent,
        recentDepartments: state.recentDepartments,
        recentDesignations: state.recentDesignations,
        views: state.views,
      }),
    },
  ),
)
