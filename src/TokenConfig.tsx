import { FC, useCallback, useState } from "react";
import jwtDecode from 'jwt-decode';

const tokenStorageKey = '_ats';
const getAccessTokenFromStorage = () => {
  const value = sessionStorage.getItem(tokenStorageKey);
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed.value && parsed.expires > Date.now()) {
      console.log('Found stored token', parsed);
      return parsed as { value: string; expires: number; };
    }
  } catch(err) {
    console.error('Failed to parse token', err);
  }
  return null;
}

export const useAccessToken = () => {
  const [token, setValidToken] = useState<{ value: string; expires: number }|null>(getAccessTokenFromStorage());
  const setToken = useCallback((value: string) => {
    try {
      const token = jwtDecode<RtvToken>(value);
      if (token && Number.isInteger(token.exp) && token.exp > (Date.now()/1000) ) {
        console.log('got valid token', token);
        const newToken = { value, expires: token.exp * 1000 };
        sessionStorage.setItem(tokenStorageKey, JSON.stringify(newToken));
        setValidToken(newToken);
      }
    } catch {
      console.error('Failed to decode token', value);
    }
  }, [setValidToken]);

  return { token, TokenConfigurator: () => <TokenConfig setToken={setToken} /> };
}

const TokenConfig: FC<{setToken: (value: string) => void }> = ({setToken}) => {
  return (
    <>
      <h1>Paste token to continue</h1>
      <label>Access Token:</label>
      <input style={{minWidth:'30ch', fontSize: '1.5rem'}} onChange={({target}) => setToken(target.value)}></input>
    </>
  )
}

interface RtvToken {
  email: string;
  exp: number;
  sub: string;
}