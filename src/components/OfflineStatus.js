import { useEffect, useState } from 'react';

export default function OfflineStatus() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/service-worker.js`)
        .then(() => navigator.serviceWorker.ready)
        .then(() => { if (active) setReady(true); })
        .catch(() => { /* Local server play still works if browser caching is unavailable. */ });
    }
    return () => { active = false; };
  }, []);
  return <p role="status">{ready ? 'Ready for offline play' : 'All chess analysis runs on this device'}</p>;
}
