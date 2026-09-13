// Registers the service worker and wires up an "Install App" button
// wherever the page includes one with [data-install-app].

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Non-fatal — the site still works fully without the service worker.
    });
  });
}

let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  document.querySelectorAll('[data-install-app]').forEach((btn) => {
    btn.hidden = false;
  });
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-install-app]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      btn.hidden = true;
    });
  });
});

window.addEventListener('appinstalled', () => {
  document.querySelectorAll('[data-install-app]').forEach((btn) => {
    btn.hidden = true;
  });
});
