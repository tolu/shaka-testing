import { useRef, useState, useCallback, useEffect } from 'react';
import shaka from 'shaka-player';

export const Player: React.FC<{ manifestUrl?: string }> = ({ manifestUrl }) => {
  const video = useRef<HTMLVideoElement | null>(null);
  const player = useRef<shaka.Player | null>(null);
  const [loading, setLoading] = useState(false);
  const vid = useCallback(videoEl => {
    shaka.polyfill.installAll();
    setLoading(s => false);
    if (shaka.Player.isBrowserSupported()) {
      video.current = videoEl;
      player.current = new shaka.Player(video.current);
      if (player.current) {
        player.current.addEventListener('error', console.error);
        if (manifestUrl === strimDash.manifestUrl) {
          player.current.configure({
            drm: {
              ...getDrmConfig('widevine', strimDash.licenseUrl),
            },
          });
        }
      }
      // player.current.con
      setLoading(s => false);
    }
  }, []);
  useEffect(() => {
    if (player.current && manifestUrl) {
      console.log('loading manifest', { manifestUrl });
      player.current
        .load(manifestUrl)
        .then(function () {
          // This runs if the asynchronous load is successful.
          console.log('The video has now been loaded! ' + manifestUrl);
        })
        .catch((e: any) => {
          console.log('oopsie...', e);
        });
    }
  }, [player.current, manifestUrl]);

  return (
    <section>
      {loading === true && <p>Loading...</p>}
      <video
        controls
        ref={vid}
        width="540"
        poster="https://gfx.nrk.no/CPyQLoJSo0GJ74VSznQqVwSlZmEmK6-eL4QQ_hAZIVdg"
      ></video>
    </section>
  );
};

const strimDash = {
  mediaFormat: 'widevine',
  protocol: 'DASH',
  manifestUrl:
    'https://rikstv-od3.telenorcdn.net/play/video_vol2/2018-09-19/HBON-ABIIF-000-PGM-01-01-2500-HD-169-SR-1920x1080-50000_(3627350_ISMUSP)manifest.ism/HBON-ABIIF-000-PGM-01-01-2500-HD-169-SR-1920x1080-50000_(3627350_ISMUSP)manifest.mpd?RikstvAssetId=rikstv_3627350',
  licenseUrl:
    'https://drm.rikstv.no/widevine/3627350?customerId=100045777&validto=2021-04-25T13:49:57.6353478Z&track=58a864af-a17e-43d4-91f5-6f67ab8eb63e&hash=eba208735479ba636e44a1ff815b442a17bc55850ef746d4f7a674f6c5fce171',
};
const drmMap = {
  widevine: 'com.widevine.alpha',
  playready: 'com.microsoft.playready',
} as const;

const getDrmConfig = (type: keyof typeof drmMap, license: string) => ({
  servers: {
    [drmMap[type]]: license,
  },
});
