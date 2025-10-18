console.log('=== PRELOAD SCRIPT LOADED ===');
console.log('Timestamp:', new Date().toISOString());

const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script starting...');

try {
  console.log('Preload script loaded successfully');
  console.log('contextBridge available:', !!contextBridge);
  console.log('ipcRenderer available:', !!ipcRenderer);

  // Expose protected methods that allow the renderer process to use
  // the ipcRenderer without exposing the entire object
  contextBridge.exposeInMainWorld('electronAPI', {
    chooseDownloadPath: () => {
      console.log('chooseDownloadPath called');
      return ipcRenderer.invoke('chooseDownloadPath');
    },
    search: (query) => {
      console.log('search called with:', query);
      return ipcRenderer.invoke('search', query);
    },
    download: (url, downloadPath) => {
      console.log('download called with:', url, downloadPath);
      return ipcRenderer.invoke('download', url, downloadPath);
    }
  });

  console.log('electronAPI exposed to window successfully');
  console.log('=== PRELOAD SCRIPT COMPLETED SUCCESSFULLY ===');
} catch (error) {
  console.error('=== PRELOAD SCRIPT ERROR ===');
  console.error('Error in preload script:', error);
  console.error('Error stack:', error.stack);
}