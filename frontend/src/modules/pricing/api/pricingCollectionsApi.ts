import { useAuth } from '../../auth/hooks/useAuth';

export const COLLECTIONS_BASE_PATH = import.meta.env.VITE_API_URL + '/collections';

export function usePricingCollectionsApi() {
  const { fetchWithInterceptor, authUser } = useAuth();

  const basicHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authUser.token}`,
  };

  const getLoggedUserCollections = async () => {
    return fetchWithInterceptor(`${import.meta.env.VITE_API_URL}/me/collections`, {
      method: 'GET',
      headers: basicHeaders,
    })
      .then(response => response.json())
      .catch(error => {
        return Promise.reject(error as Error);
      });
  };

  return { getLoggedUserCollections };
}
