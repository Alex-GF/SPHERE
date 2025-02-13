import { useAuth } from '../../auth/hooks/useAuth';
import { CollectionToCreate } from '../types/profile-types';

export const COLLECTIONS_BASE_PATH = import.meta.env.VITE_API_URL + '/pricings/collections';

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

  const createCollection = async (collection: CollectionToCreate) => {
    return fetchWithInterceptor(COLLECTIONS_BASE_PATH, {
      method: 'POST',
      headers: basicHeaders,
      body: JSON.stringify(collection),
    })
      .then(response => response.json())
      .catch(error => {
        return Promise.reject(error as Error);
      });
  };

  const getCollectionByOwnerAndName = (ownerId: string, collectionName: string) => {
    return fetchWithInterceptor(`${COLLECTIONS_BASE_PATH}/${ownerId}/${collectionName}`, {
      method: 'GET',
      headers: basicHeaders,
    })
      .then(response => response.json())
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }

  return { getLoggedUserCollections, createCollection, getCollectionByOwnerAndName };
}
