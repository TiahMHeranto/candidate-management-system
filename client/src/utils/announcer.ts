let announcerElement: HTMLElement | null = null;

const getAnnouncer = () => {
  // Re-query if the cached node was removed from the DOM (e.g. between tests)
  if (!announcerElement?.isConnected) {
    announcerElement = document.getElementById('a11y-announcer');
  }
  return announcerElement;
};

export const announceToScreenReader = (message: string, delay: number = 3000) => {
  const announcer = getAnnouncer();
  if (announcer) {
    announcer.textContent = message;
    setTimeout(() => {
      if (announcer.textContent === message) {
        announcer.textContent = '';
      }
    }, delay);
  }
};