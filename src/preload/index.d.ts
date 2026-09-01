import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      pickExecutable: () => Promise<string | undefined>
      searchGame: (name: string) => Promise<any>
      getArtwork: (id: number) => Promise<any>
      launchGame: (exePath: string) => Promise<void>
    }
  }
}
