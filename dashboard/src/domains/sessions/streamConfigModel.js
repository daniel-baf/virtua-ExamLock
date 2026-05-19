export const STREAM_RESOLUTION_LABELS = {
  '480p': '480p',
  '720p': '720p',
  '1080p': '1080p',
};

export const STREAM_INTERVAL_LABELS = {
  1000: '1s',
  2000: '2s',
  5000: '5s',
};

export function formatStreamConfig(streamConfig) {
  if (!streamConfig) return 'Stream por defecto';

  const resolution = STREAM_RESOLUTION_LABELS[streamConfig.resolutionPreset] ?? `${streamConfig.maxWidth}x${streamConfig.maxHeight}`;
  const interval = STREAM_INTERVAL_LABELS[streamConfig.intervalMs] ?? `${Math.round(streamConfig.intervalMs / 1000)}s`;
  return `${resolution} · cada ${interval}`;
}
