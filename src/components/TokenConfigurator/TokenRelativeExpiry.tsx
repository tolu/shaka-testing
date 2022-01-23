import { FC } from 'react';

export const TokenRelativeExpiry: FC<{ token: { expires: number } }> = ({
  token,
}) => {
  const validityHours = (token.expires - Date.now()) / 1000 / 60 / 60;
  const flooredHours = Math.floor(validityHours);
  const minutes = Math.floor((validityHours - flooredHours) * 60);
  const relativeExpiresHours = new Intl.RelativeTimeFormat('en', {
    style: 'long',
  }).format(flooredHours, 'hours');
  const minutesString = minutes > 1 ? ` and ${minutes} minutes` : '';
  return <p>{`Token expires ${relativeExpiresHours}${minutesString}`}</p>;
};
