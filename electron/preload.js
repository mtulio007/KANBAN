import { contextBridge, ipcRenderer } from 'electron';
const api = {};
// Expose DB paths
ipcRenderer.invoke('get-db-paths').then((paths) => {
    api.dbPaths = paths;
});
contextBridge.exposeInMainWorld('electronAPI', api);
