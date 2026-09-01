import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  pickExecutable: () => ipcRenderer.invoke('dialog:openFile'),
  searchGame: (name: string) => ipcRenderer.invoke('steamgriddb:search', name),
  getArtwork: (id: number) => ipcRenderer.invoke('steamgriddb:artwork', id),
  launchGame: (exePath: string) => ipcRenderer.invoke('game:launch', exePath)
  
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
