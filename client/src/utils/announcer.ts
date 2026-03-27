let announcerElement: HTMLElement | null = null;

const getAnnouncer = () => {
  if (!announcerElement) {
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