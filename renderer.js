const { ipcRenderer } = require('electron');

// Load saved download path
let downloadPath = localStorage.getItem('downloadPath') || null;
updatePathDisplay();

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab
    button.classList.add('active');
    const tabId = button.getAttribute('data-tab') + '-tab';
    document.getElementById(tabId).classList.add('active');
  });
});

// Choose download path
document.getElementById('choosePath').addEventListener('click', async () => {
  const path = await ipcRenderer.invoke('chooseDownloadPath');
  if (path) {
    downloadPath = path;
    localStorage.setItem('downloadPath', path);
    updatePathDisplay();
  }
});

function updatePathDisplay() {
  const pathElement = document.getElementById('downloadPath');
  if (downloadPath) {
    const shortPath = downloadPath.length > 30 ? '...' + downloadPath.slice(-27) : downloadPath;
    pathElement.textContent = `下載路徑: ${shortPath}`;
  } else {
    pathElement.textContent = '下載路徑: 預設';
  }
}

document.getElementById('downloadNames').addEventListener('click', async () => {
  const button = document.getElementById('downloadNames');
  const names = document.getElementById('names').value.split('\n').filter(n => n.trim());
  const status = document.getElementById('status');
  const progressContainer = document.getElementById('namesProgress');
  const progressFill = document.getElementById('namesProgressFill');
  const progressText = document.getElementById('namesProgressText');
  
  if (names.length === 0) return;
  
  // Show progress bar
  progressContainer.style.display = 'block';
  progressFill.style.width = '0%';
  progressText.textContent = '0%';
  
  // Disable button and show loading
  button.disabled = true;
  button.classList.add('loading');
  button.textContent = '下載中...';
  
  status.textContent = '下載中...';
  
  let completed = 0;
  const total = names.length;
  
  for (const name of names) {
    try {
      const url = await ipcRenderer.invoke('search', name.trim());
      const result = await ipcRenderer.invoke('download', url, downloadPath);
      status.textContent += `\n已下載: ${name}`;
      
      completed++;
      const progress = Math.round((completed / total) * 100);
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${progress}%`;
    } catch (error) {
      status.textContent += `\n${name} 錯誤: ${error}`;
      
      completed++;
      const progress = Math.round((completed / total) * 100);
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${progress}%`;
    }
  }
  
  status.textContent += '\n完成';
  
  // Hide progress bar after a short delay
  setTimeout(() => {
    progressContainer.style.display = 'none';
  }, 2000);
  
  // Re-enable button
  button.disabled = false;
  button.classList.remove('loading');
  button.textContent = '開始下載';
});

document.getElementById('downloadUrls').addEventListener('click', async () => {
  const button = document.getElementById('downloadUrls');
  const urls = document.getElementById('urls').value.split('\n').filter(u => u.trim());
  const status = document.getElementById('status');
  const progressContainer = document.getElementById('urlsProgress');
  const progressFill = document.getElementById('urlsProgressFill');
  const progressText = document.getElementById('urlsProgressText');
  
  if (urls.length === 0) return;
  
  // Show progress bar
  progressContainer.style.display = 'block';
  progressFill.style.width = '0%';
  progressText.textContent = '0%';
  
  // Disable button and show loading
  button.disabled = true;
  button.classList.add('loading');
  button.textContent = '下載中...';
  
  status.textContent = '下載中...';
  
  let completed = 0;
  const total = urls.length;
  
  for (const url of urls) {
    try {
      const result = await ipcRenderer.invoke('download', url.trim(), downloadPath);
      status.textContent += `\n已下載: ${url}`;
      
      completed++;
      const progress = Math.round((completed / total) * 100);
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${progress}%`;
    } catch (error) {
      status.textContent += `\n${url} 錯誤: ${error}`;
      
      completed++;
      const progress = Math.round((completed / total) * 100);
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${progress}%`;
    }
  }
  
  status.textContent += '\n完成';
  
  // Hide progress bar after a short delay
  setTimeout(() => {
    progressContainer.style.display = 'none';
  }, 2000);
  
  // Re-enable button
  button.disabled = false;
  button.classList.remove('loading');
  button.textContent = '開始下載';
});