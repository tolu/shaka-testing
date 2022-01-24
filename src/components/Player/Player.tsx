import { FC, useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import shaka from 'shaka-player';
import { Playable } from '../../modules/api';
import styles from './Player.module.css';

// TODO: Get inspired by: https://github.com/matvp91/shaka-player-react/blob/master/src/index.js

type DeepPartial<T> = {
  [K in keyof T]?: DeepPartial<T[K]>;
};

export type VideoAsset = Playable & { poster: string };
export const Player: FC<{ playable: VideoAsset }> = ({ playable }) => {
  const player = useRef<PlayerRef | null>(null);
  const config = getDrmConfig(playable);
  useEffect(() => {
    (window as any).getPlayer = () => player.current;
  }, []);

  return (
    <section>
      <ShakaPlayer
        controls
        autoPlay={false}
        ref={player}
        manifestUrl={playable.manifestUrl}
        poster={playable.poster}
        className={styles.playerWrapper}
        shakaConfig={config}
      />
    </section>
  );
};

const drmMap = {
  fairplay: 'com.apple.fps.1_0',
  widevine: 'com.widevine.alpha',
  playready: 'com.microsoft.playready',
} as const;

type PartialPlayerConfig = DeepPartial<shaka.extern.PlayerConfiguration>;
const getDrmConfig = (playable: Playable): PartialPlayerConfig | undefined => {
  if (!playable.licenseUrl || playable.mediaFormat === 'none') return undefined;

  // TODO test fairplay config: https://shaka-player-demo.appspot.com/docs/api/tutorial-fairplay.html
  const drmType = drmMap[playable.mediaFormat];
  const drmConfig: PartialPlayerConfig['drm'] = {
    servers: {
      [drmType]: playable.licenseUrl,
    },
  };
  if (playable.mediaFormat === 'fairplay' && playable.applicationCertificate) {
    drmConfig.advanced = {
      [drmType]: { serverCertificate: new TextEncoder().encode(playable.applicationCertificate) },
    };
  }
  return { drm: drmConfig };
};
interface ShakaProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  manifestUrl: string;
  shakaConfig?: PartialPlayerConfig;
  className?: string;
}
interface PlayerRef {
  readonly player: shaka.Player | null;
  readonly videoElement: HTMLVideoElement | null;
}
const ShakaPlayer = forwardRef<PlayerRef, ShakaProps>(
  ({ manifestUrl, shakaConfig, className, ...videoProps }, ref) => {
    const uiContainerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [player, setPlayer] = useState<shaka.Player | null>(null);

    // Effect to handle component mount & mount.
    // Not related to the src prop, this hook creates a shaka.Player instance.
    // This should always be the first effect to run.
    useEffect(() => {
      const isBrowserSupported = shaka.Player.isBrowserSupported();
      console.log('[shaka] init', { isBrowserSupported });
      shaka.polyfill.installAll();
      let player: shaka.Player | null;
      if (isBrowserSupported) {
        player = new shaka.Player(videoRef.current);
        player.addEventListener('error', console.error);
        setPlayer(player);
      } else {
        console.error('Browser not supported');
      }

      return () => {
        player?.destroy();
      };
    }, []);

    // Keep shaka.Player.configure in sync.
    useEffect(() => {
      if (player && shakaConfig) {
        console.log('[shaka] update config', shakaConfig);
        player.configure(shakaConfig);
      }
    }, [player, shakaConfig]);

    // Load the source url when we have one.
    useEffect(() => {
      if (player && manifestUrl) {
        console.log('[shaka] load manifest', manifestUrl);
        player
          .load(manifestUrl)
          .then(() => {
            console.log('[shaka] manifest loaded', {
              textLanguages: player.getTextLanguages(),
              audioLanguages: player.getAudioLanguages(),
            });
            player.getAudioLanguages();
          })
          .catch(err => console.error('video load failed', err));
      }
    }, [player, manifestUrl]);

    // Define a handle for easily referencing Shaka's player & ui API's.
    useImperativeHandle<PlayerRef, PlayerRef>(
      ref,
      () => ({
        get player() {
          return player;
        },
        get videoElement() {
          return videoRef.current;
        },
      }),
      [player]
    );

    return (
      <div ref={uiContainerRef} className={className}>
        <video
          ref={videoRef}
          style={{
            maxWidth: '100%',
            width: '100%',
          }}
          {...videoProps}
        />
      </div>
    );
  }
);
