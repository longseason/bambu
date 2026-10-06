export type ItemType = 'game' | 'movie'

export interface LibraryItem {
  id: string
  name: string
  cover: string
  exePath: string
  type: ItemType
  dateAdded: string          // ISO
  playtimeSeconds: number
  lastPlayed: string | null  // ISO
  favorite?: boolean
  collections?: string[]
}