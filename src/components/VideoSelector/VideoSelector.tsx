import { FC, useCallback, useRef, useState } from 'react';
import useSWRImmutable, { SWRConfiguration } from 'swr';
import { getPlayable, getStartPageLists, getSwimlaneItems } from '../../modules/api';
import { VideoAsset } from '../Player/Player';
import styles from './VideoSelector.module.css';

// TODO: create component from media slider https://codepen.io/toblu/pen/ZEeWgxy

interface Props {
  accessToken: string;
  setPlayable: (playable: VideoAsset) => void;
}

export const VideoSelector: FC<Props> = props => {
  const { isValidating, assetLists } = useAssetLists(props.accessToken);
  return (
    <>
      <h2>Video selector</h2>
      {isValidating && <p>Loading...</p>}
      <section className={styles.section}>
        {assetLists &&
          assetLists.swimlanes
            .filter(s => s.type !== 'Menu')
            .slice(0, 5)
            .map(s => <AssetList list={s} {...props} key={s.id} />)}
      </section>
    </>
  );
};

const loadDetails = (detailsHref: string, token: string) => {
  const reqInit = getAuthConfig(token);
  return fetch(detailsHref, reqInit)
    .then(res => res.json())
    .then((json: AssetsList[0]) => {
      return getPlayable(json._links, reqInit);
    });
};

const AssetList: FC<Props & { list: AssetLists['swimlanes'][0] }> = ({
  list,
  accessToken,
  setPlayable,
}) => {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [open, setIsOpen] = useState(false);
  const handleToggle = useCallback(() => {
    setIsOpen(detailsRef.current?.open ?? false);
  }, [setIsOpen]);
  const handleVideoClick = useCallback(
    (item: AssetsList[0]) => {
      console.log('Clicked', item);
      loadDetails(item._links.details.href, accessToken).then(playable => {
        console.log('setting playable', playable);
        setPlayable({ ...playable, poster: item.card.image });
      });
    },
    [accessToken]
  );

  const { isValidating, data = [] } = useSWRImmutable<AssetsList>(
    open ? list.link : null,
    url => getSwimlaneItems(url, getAuthConfig(accessToken)),
    swrConfig
  );

  const title = `${list.name} (${list.type.toLowerCase()})`;
  const isLoading = data.length === 0 && isValidating;
  return (
    <details className={styles.details} ref={detailsRef} onToggle={handleToggle}>
      <summary>{title}</summary>
      {isLoading && <p>Loading...</p>}
      <ul className={styles.slider}>
        {data.map(a => {
          return (
            <li key={a.id}>
              <a href="#" onClick={evt => (evt.preventDefault(), handleVideoClick(a))}>
                <figure>
                  <picture>
                    <img src={`${a.card.image}?height=200`} alt={a.card.title} loading="lazy" />
                  </picture>
                  <figcaption>{a.card.title}</figcaption>
                  <div className={styles.pictureOverlay}>
                    <span className={styles.assetMeta}>{a.card.subtitles[0]?.value ?? ''}</span>
                  </div>
                  <div className={styles.pictureOverlay}>
                    <img className={styles.serviceLogo} src={a.originChannel.logoUrlSvgSquare} />
                  </div>
                </figure>
              </a>
            </li>
          );
        })}
      </ul>
    </details>
  );
};

type AssetLists = Awaited<ReturnType<typeof getStartPageLists>>;
type AssetsList = Awaited<ReturnType<typeof getSwimlaneItems>>;
const useAssetLists = (accessToken: string) => {
  const { data: assetLists, isValidating } = useSWRImmutable<AssetLists>(
    '/pages/start',
    url => getStartPageLists(getAuthConfig(accessToken)),
    swrConfig
  );
  return { isValidating, assetLists };
};

const swrConfig: SWRConfiguration = {
  dedupingInterval: 60_000,
};

const getAuthConfig = (accessToken: string): RequestInit => {
  return {
    headers: {
      authorization: `Bearer ${accessToken}`,
      ['x-rikstv-appinstallationid']: '11538a6c-4fd3-4bf6-b939-64febcae9aff',
      ['x-rikstv-application']: 'Strim-Browser/beta',
    },
  };
};
