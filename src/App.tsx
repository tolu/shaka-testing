// mux.js is imported in index.html
import styles from './App.module.css';
import { Player } from './Player';
import { useAccessToken } from './TokenConfig';
import { VideoSelector } from './components/VideoSelector/VideoSelector';

const manifests = {
  hls: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-hls-apple/master.m3u8',
  dash: 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
  // uses ts files and need mux.js for playback (except in Edge)
  nrkHls:
    'https://nrk-od-32.akamaized.net/world/1193332/0/hls/muha13106879/playlist.m3u8?bw_low=10&bw_high=6000&bw_start=1800&no_iframes&no_audio_only&no_subtitles',
};

function App() {
  const { token, TokenConfigurator } = useAccessToken();
  if (!token) {
    return (
      <div className={styles.app}>
        <TokenConfigurator />
      </div>
    );
  }
  const validityHours = (token.expires - Date.now())/1000/60/60;

  return (
    <div className={styles.app}>
      <header>
        <h1>Shaka Experimenting</h1>
        <p>{`Token expires ${new Intl.RelativeTimeFormat('en', {
          style: 'long',
        }).format(validityHours, 'hours')}`}</p>
      </header>
      <main>
        <Player manifestUrl={manifests.nrkHls} />
        <VideoSelector accessToken={token.value} />
      </main>
    </div>
  );
}

export default App;
