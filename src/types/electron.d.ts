// src/types/electron.d.ts
export interface ElectronAPI {
  chooseDownloadPath: () => Promise<string | null>
  search: (query: string) => Promise<string>
  download: (url: string, downloadPath?: string) => Promise<string>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}