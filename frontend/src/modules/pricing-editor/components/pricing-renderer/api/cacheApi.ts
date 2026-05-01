import { useAuth } from '../../../../auth/hooks/useAuth';

export const CACHE_BASE_PATH = import.meta.env.VITE_API_URL + '/cache';

export function useCacheApi() {
  const { authUser } = useAuth();

  const basicHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authUser?.token}`,
  };

  const getFromCache = async (key: string) => {
    return fetch(
      `${CACHE_BASE_PATH}?key=${key}`,
      {
        method: 'GET',
        headers: basicHeaders,
      }
    )
      .then(response => response.json())
      .then(data => {
        if (data.error){
          return Promise.reject(data.error);
        }else{
          return data;
        }
      })
      .catch(async error => {
        const body = await (error as Response).json().catch(() => ({}));
        return Promise.reject(body as Error);
      });
  };

  const setInCache = async (key: string, value: string, expirationInSeconds?: number) => {
    return fetch(
      `${CACHE_BASE_PATH}`,
      {
        method: 'POST',
        headers: basicHeaders,
        body: JSON.stringify({
          key,
          value,
          expirationInSeconds
        }),
      }
    )
      .then(response => response.json())
      .then(data => {
        if (data.error){
          return Promise.reject(data.error);
        }else{
          return data;
        }
      })
      .catch(async error => {
        const body = await (error as Response).json().catch(() => ({}));
        return Promise.reject(body as Error);
      });
  };

  return {
    getFromCache,
    setInCache,
  };
}
