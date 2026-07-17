import React from 'react';

const VIDEO_EXTS = ['.mp4', '.webm', '.mov'];

export function isVideoUrl(url) {
  if (!url) return false;
  const lower = url.split('?')[0].toLowerCase();
  return VIDEO_EXTS.some((ext) => lower.endsWith(ext));
}

// Renders an <img> for images/gifs and a <video> for mp4/webm/mov.
// Video plays muted+looped+auto for background-style UX (unmute handled by caller if needed).
export function renderMedia(url, style = {}, videoProps = {}) {
  if (!url) return null;
  if (isVideoUrl(url)) {
    return (
      <video
        src={url}
        autoPlay
        muted
        loop
        playsInline
        style={{ display: 'block', ...style }}
        {...videoProps}
      />
    );
  }
  return <img src={url} alt="" style={style} />;
}

export default renderMedia;
