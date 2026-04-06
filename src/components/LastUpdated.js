import React, { useState, useEffect } from 'react';

const LastUpdated = ({ lastUpdated }) => {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (!lastUpdated) return;

    const updateSeconds = () => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000));
    };

    updateSeconds(); // initial
    const intervalId = setInterval(updateSeconds, 1000);
    return () => clearInterval(intervalId);
  }, [lastUpdated]);

  if (!lastUpdated) return null;

  return (
    <div className="last-updated">
      Last updated: {new Date(lastUpdated).toLocaleTimeString()} ({secondsAgo} s ago)
    </div>
  );
};

export default LastUpdated;