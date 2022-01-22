import React, { useCallback, useEffect, useRef, useState } from 'react'
// mux.js is imported in index.html
import styles from './App.module.css'
import { Player } from './Player';
import { useAccessToken } from './TokenConfig';

const manifests = {
  hls: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-hls-apple/master.m3u8',
  dash: 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
  // uses ts files and need mux.js for playback (except in Edge)
  nrkHls: 'https://nrk-od-32.akamaized.net/world/1193332/0/hls/muha13106879/playlist.m3u8?bw_low=10&bw_high=6000&bw_start=1800&no_iframes&no_audio_only&no_subtitles'
}

function App() {

  const {token, TokenConfigurator} = useAccessToken();
  if (!token) {
    return (
    <div className={styles.app}>
      <TokenConfigurator />
    </div>
    )
  }
  const expDate = new Date(token.expires);

  return (
    <div className={styles.app}>
      <header>
        <p>Strim Shaka Experiment</p>
        <p>{`Token valid until: ${ new Intl.DateTimeFormat('en', { dateStyle: 'full', timeStyle: 'long' }).format(expDate) }`}</p>
      </header>
      <main>
        <Player manifestUrl={manifests.nrkHls} />
      </main>
    </div>
  )
}

export default App
