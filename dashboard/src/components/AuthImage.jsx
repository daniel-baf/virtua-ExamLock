import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function AuthImage({ uid, src, alt, className }) {
  const [blobUrl, setBlobUrl] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';
    setBlobUrl('');
    setFailed(false);

    if (!src || !uid) return undefined;

    api.imageBlobUrl(uid, src)
      .then(url => {
        if (cancelled) {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url.startsWith('blob:') ? url : '';
        setBlobUrl(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [uid, src]);

  if (failed) {
    return <div className={className}>No se pudo cargar</div>;
  }

  if (!blobUrl) {
    return <div className={className}>Cargando...</div>;
  }

  return <img src={blobUrl} alt={alt} className={className} />;
}
