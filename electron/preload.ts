import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from '../src/electron-types';

const api: ElectronAPI = {};

// Expose DB paths
ipcRenderer.invoke('get-db-paths').then((paths) => {
  api.dbPaths = paths;
});

contextBridge.exposeInMainWorld('electronAPI', api);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
