// mux.js is imported in index.html
import styles from './App.module.css';
import { Player, PlayerModel } from './components/VideoSelector/Player';
import { useAccessToken } from './components/TokenConfigurator/TokenConfig';
import { VideoSelector } from './components/VideoSelector/VideoSelector';
import { useState } from 'react';
import { TokenRelativeExpiry } from './components/TokenConfigurator/TokenRelativeExpiry';

const manifests = {
  hls: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-hls-apple/master.m3u8',
  dash: 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
  // uses ts files and need mux.js for playback (except in Edge)
  nrkHls:
    'https://nrk-od-32.akamaized.net/world/1193332/0/hls/muha13106879/playlist.m3u8?bw_low=10&bw_high=6000&bw_start=1800&no_iframes&no_audio_only&no_subtitles',
};

const defaults: PlayerModel = {
  manifestUrl: manifests.nrkHls,
  mediaFormat: 'none',
  protocol: 'HLS',
  licenseUrl: '',
  poster: 'https://gfx.nrk.no/CPyQLoJSo0GJ74VSznQqVwSlZmEmK6-eL4QQ_hAZIVdg',
};

function App() {
  const { token, TokenConfigurator } = useAccessToken();
  const [playable, setPlayable] = useState<PlayerModel>(defaults);
  if (!token) {
    return (
      <div className={styles.app}>
        <TokenConfigurator />
      </div>
    );
  }
  return (
    <div className={styles.app}>
      <header>
        <h1>Shaka Experimenting</h1>
        <TokenRelativeExpiry token={token} />
      </header>
      <main>
        <Player playable={playable} />
        <VideoSelector accessToken={token.value} setPlayable={setPlayable} />
      </main>
    </div>
  );
}

export default App;
