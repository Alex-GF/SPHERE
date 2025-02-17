import { useAuth } from '../../auth/hooks/useAuth';
import { CollectionToCreate } from '../types/profile-types';

export const COLLECTIONS_BASE_PATH = import.meta.env.VITE_API_URL + '/pricings/collections';

export function usePricingCollectionsApi() {
  const { fetchWithInterceptor, authUser } = useAuth();

  const basicHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authUser.token}`,
  };

  const getCollections = async (filters?: Record<string, string>) => {
    let requestUrl;

    if (Object.keys(filters ?? {}).length === 0) {
      requestUrl = `${COLLECTIONS_BASE_PATH}`;
    } else {
      const filterParams = new URLSearchParams();
      Object.entries(filters ?? {}).forEach(([key, value]) => {
        if (value.trim().length > 0) filterParams.append(key, value as string);
      });
      requestUrl = `${COLLECTIONS_BASE_PATH}?${filterParams.toString()}`;
    }

    return fetch(requestUrl, {
      method: 'GET',
      headers: basicHeaders,
    })
      .then(response => response.json())
      .catch(error => {
        return Promise.reject(error as Error);
      });
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

  const getCollectionByOwnerAndName = async (ownerId: string, collectionName: string) => {
    return fetchWithInterceptor(`${COLLECTIONS_BASE_PATH}/${ownerId}/${collectionName}`, {
      method: 'GET',
      headers: basicHeaders,
    })
      .then(response => response.json())
      .catch(error => {
        return Promise.reject(error as Error);
      });
  };

  const updateCollection = async (collectionName: string, collectionData: any) => {
    return fetchWithInterceptor(`${COLLECTIONS_BASE_PATH}/${authUser.user!.id}/${collectionName}`, {
      method: 'PUT',
      headers: basicHeaders,
      body: JSON.stringify(collectionData),
    })
      .then(async response => response.json())
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }

  const deleteCollection = async (collectionName: string, deleteCascade: boolean) => {
    return fetchWithInterceptor(`${COLLECTIONS_BASE_PATH}/${authUser.user!.id}/${collectionName}?cascade=${deleteCascade}`, {
      method: 'DELETE',
      headers: basicHeaders
    })
      .then(async response => response.json())
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }

  return {
    getLoggedUserCollections,
    createCollection,
    getCollectionByOwnerAndName,
    getCollections,
    updateCollection,
    deleteCollection
  };
}
