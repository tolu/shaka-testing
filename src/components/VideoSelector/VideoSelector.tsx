import { FC, useCallback, useRef, useState } from 'react';
import useSWRImmutable, { SWRConfiguration } from 'swr';
import { getStartPageLists, getSwimlaneItems } from '../../modules/api';
import styles from './VideoSelector.module.css';

interface Props {
  accessToken: string;
}

export const VideoSelector: FC<Props> = ({accessToken}) => {
  const { isValidating, assetLists } = useAssetLists(accessToken);
  return (
    <>
      <h2>Video selector</h2>
      {isValidating && <p>Loading...</p>}
      <section className={styles.section}>
        {assetLists &&
          assetLists.swimlanes
            .slice(0, 5)
            .map(s => <AssetList list={s} accessToken={accessToken} key={s.id} />)}
      </section>
    </>
  );
};

const AssetList: FC<{ list: AssetLists['swimlanes'][0], accessToken: string }> = ({ list, accessToken }) => {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [open, setIsOpen] = useState(false);
  const handleToggle = useCallback(() => {
    setIsOpen(detailsRef.current?.open ?? false);
  }, [setIsOpen]);

  const { isValidating, data = [] } = useSWRImmutable<AssetsList>(open ? list.link : null, (url) => getSwimlaneItems(url, getAuthConfig(accessToken)), swrConfig);

  const title = `${list.name} (${list.type.toLowerCase()})`;
  const isLoading = data.length === 0 && isValidating;
  return (
    <details className={styles.details} ref={detailsRef} onToggle={handleToggle}>
      <summary>{title}</summary>
      {isLoading && <p>Loading...</p>}
      <ul className={styles.slider}>
        {data.map(a => {
          return (
          <li>
            <a href="#">
              <figure>
                <picture>
                  <img src={`${a.card.image}?height=200`} alt={a.card.title} loading="lazy" />
                </picture>
                <figcaption>{a.card.title}</figcaption>
              </figure>
            </a>
          </li>)
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
    (url) => getStartPageLists(getAuthConfig(accessToken)),
    swrConfig
  );
  return { isValidating, assetLists };
};

const swrConfig: SWRConfiguration = {
  dedupingInterval: 60_000,
};

const getAuthConfig = (accessToken: string): RequestInit => {
  return { headers: { 'authorization': `Bearer ${accessToken}` } };
}
