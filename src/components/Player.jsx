import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const Player = () => {
  const { deviceId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await api.get(`/devices/${deviceId}/playlist`);
        setPlaylist(response.data);
      } catch (err) {
        setError('Failed to fetch playlist');
        console.error(err);
      }
    };

    fetchPlaylist();
  }, [deviceId]);

  useEffect(() => {
    if (playlist && playlist.media.length > 0) {
      const savedIndex = localStorage.getItem(`player-media-index-${deviceId}`);
      if (savedIndex) {
        setCurrentMediaIndex(parseInt(savedIndex, 10));
      }

      const interval = setInterval(() => {
        setCurrentMediaIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % playlist.media.length;
          localStorage.setItem(`player-media-index-${deviceId}`, nextIndex);
          return nextIndex;
        });
      }, playlist.media[currentMediaIndex].duration * 1000);

      return () => clearInterval(interval);
    }
  }, [playlist, currentMediaIndex, deviceId]);

  if (error) {
    return <div className="w-full h-screen flex items-center justify-center bg-black text-white">Error: {error}</div>;
  }

  if (!playlist) {
    return <div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading playlist...</div>;
  }

  const currentMedia = playlist.media[currentMediaIndex];

  return (
    <div className="w-full h-screen bg-black">
      {currentMedia.type === 'image' ? (
        <img src={currentMedia.url} alt={currentMedia.name} className="w-full h-full object-contain" />
      ) : (
        <video src={currentMedia.url} autoPlay muted className="w-full h-full object-contain" />
      )}
    </div>
  );
};

export default Player;
