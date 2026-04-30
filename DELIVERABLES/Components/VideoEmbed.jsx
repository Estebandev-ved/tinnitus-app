import React from 'react';
export default function VideoEmbed({ src }) {
  return (
    <div className="video-placeholder">
      <p>Video Placeholder: {src}</p>
    </div>
  );
}
