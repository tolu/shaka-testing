import { useRef, useState, useCallback, useEffect } from 'react';
import shaka from 'shaka-player';
import { Playable } from './modules/api';

export type PlayerModel = Playable & { poster: string; };
export const Player: React.FC<{ playable: PlayerModel }> = ({ playable }) => {
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
        if (playable.licenseUrl) {
          player.current.configure({
            drm: {
              ...getDrmConfig(playable.mediaFormat, playable.licenseUrl),
            },
          });
        }
      }
      // player.current.con
      setLoading(s => false);
    }
  }, [playable]);
  useEffect(() => {
    if (player.current && playable) {
      console.log('loading manifest', playable.manifestUrl);
      player.current
        .load(playable.manifestUrl)
        .then(() => {
          // This runs if the asynchronous load is successful.
          console.log('The video has now been loaded! ' + playable.manifestUrl);
        })
        .catch((e: any) => {
          console.log('oopsie...', e);
        });
    }
  }, [player.current, playable]);

  return (
    <section>
      {loading === true && <p>Loading...</p>}
      <video
        controls
        ref={vid}
        width="540"
        poster={playable.poster}
      ></video>
    </section>
  );
};

const drmMap = {
  fairplay: 'com.apple.fps.1_0',
  widevine: 'com.widevine.alpha',
  playready: 'com.microsoft.playready',
} as const;

const getDrmConfig = (type: keyof typeof drmMap, license: string) => ({
  servers: {
    [drmMap[type]]: license,
  },
});
