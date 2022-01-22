
export const getStartPageLists = async (options?: RequestInit) => {
  const res = await fetch('https://contentlayout.rikstv.no/1/pages/start', options);
  return (await res.json()) as StartPageResponse;
};

export const getSwimlaneItems = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  const data = (await res.json()) as SwimlaneItem[];
  return data.filter(({ streamingMode }) => streamingMode === 'OnDemand');
};

interface StartPageResponse {
  id: string;
  slug: string;
  title: string;
  lastUpdatedUtc: Date;
  swimlanes: Swimlane[];
  inSubscription: boolean;
  experiments: any[];
}

interface Swimlane {
  id: string;
  name: string;
  type: 'ContinueWatching' | 'Default' | 'Menu' | 'MyList' | 'OnTvNow';
  style: string;
  link: string;
  supportsPaging: boolean;
  lastUpdatedUtc: Date;
}

interface SwimlaneItem {
  id: string;
  card: Card;
  originChannel: OriginChannel;
  broadcastedTime: Date;
  publishFromUtc: Date;
  publishToUtc: Date;
  season?: number;
  episode?: number;
  titleType: TitleType;
  streamingMode: StreamingMode;
  originalTitle?: string;
  inCatchupArchive?: boolean;
  _links: SwimlaneItemLinks;
}

interface SwimlaneItemLinks {
  details: HalLink;
  coverPage: HalLink;
  series?: HalLink;
  nextEpisode?: HalLink;
  wish: HalLink;
  excludeFromContinueWatching: HalLink;
  universalplay: HalLink;
}

interface HalLink {
  href: string;
}

interface Behavior {
  from: Date;
  to: Date;
  target: 'OpenCoverPage' | 'PlayChannel';
}

interface Card {
  title: string;
  image: string;
  subtitles: Subtitle[];
  behaviors: Behavior[];
}

interface Subtitle {
  from: Date;
  to: Date;
  value: string;
}

interface OriginChannel {
  channelId: number;
  serviceName: string;
  logoUrlSvgSquare: string;
}

type StreamingMode = 'External' | 'OnDemand';

type TitleType = 'Linear' | 'SVOD';
