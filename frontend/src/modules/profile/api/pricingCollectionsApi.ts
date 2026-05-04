import { useAuth } from '../../auth/hooks/useAuth';
import { useCallback, useMemo } from 'react';
import { CollectionToCreate } from '../types/profile-types';

export const COLLECTIONS_BASE_PATH = import.meta.env.VITE_API_URL + '/collections';

export function usePricingCollectionsApi() {
  const { fetchWithInterceptor, authUser } = useAuth();

  const token = authUser?.token;
  const username = authUser?.user?.username;

  const basicHeaders = useMemo(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }, [token]);

  const getCollections = useCallback(async (filters?: Record<string, string | number>) => {
    let requestUrl;

    if (Object.keys(filters ?? {}).length === 0) {
      requestUrl = `${COLLECTIONS_BASE_PATH}`;
    } else {
      const filterParams = new URLSearchParams();
      Object.entries(filters ?? {}).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        // numeric pagination params
        if (key === 'limit' || key === 'offset') {
          filterParams.append(key, String(value));
          return;
        }
        if ((value as string).trim && (value as string).trim().length > 0) filterParams.append(key, value as string);
      });
      requestUrl = `${COLLECTIONS_BASE_PATH}?${filterParams.toString()}`;
    }

    return fetchWithInterceptor(requestUrl, {
      method: 'GET',
      headers: basicHeaders,
    })
      .then(response => response.json())
      .catch(async error => {
        const body = await (error as Response).json().catch(() => ({}));
        return Promise.reject(body as Error);
      });
  }, [fetchWithInterceptor, basicHeaders]);

  const getLoggedUserCollections = useCallback(async () => {
    return fetchWithInterceptor(`${COLLECTIONS_BASE_PATH}/${username}`, {
      method: 'GET',
      headers: basicHeaders,
    })
      .then(response => response.json())
      .then(data => ({
        ...data,
        collections: data.collections ?? [],
      }))
      .catch(async error => {
        const body = await (error as Response).json().catch(() => ({}));
        return Promise.reject(body as Error);
      });
  }, [fetchWithInterceptor, basicHeaders, username]);

  const createCollection = useCallback(async (collection: CollectionToCreate) => {
    return fetchWithInterceptor(`${COLLECTIONS_BASE_PATH}/${username}`, {
      method: 'POST',
      headers: basicHeaders,
      body: JSON.stringify(collection),
    })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          // Normalize error with status for caller
          const message = data?.error || data?.message || response.statusText || 'Error creating collection';
          type ErrorWithStatus = Error & { status?: number };
          const e = new Error(message) as ErrorWithStatus;
          e.status = response.status;
          return Promise.reject(e);
        }
        return data;
      })
      .catch(error => {
  return Promise.reject(error instanceof Error ? error : new Error(String(error)));
      });
  }, [fetchWithInterceptor, basicHeaders, username]);
  
  const createBulkCollection = useCallback(async (formData: FormData) => {
    return fetchWithInterceptor(`${COLLECTIONS_BASE_PATH}/${username}/bulk`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = data?.error || data?.message || response.statusText || 'Error creating collection';
          type ErrorWithStatus = Error & { status?: number };
          const e = new Error(message) as ErrorWithStatus;
          e.status = response.status;
          return Promise.reject(e);
        }
        if (data.error){
          type ErrorWithStatus = Error & { status?: number };
          const e = new Error(data.error) as ErrorWithStatus;
          e.status = 500;
          return Promise.reject(e);
        }
        return data;
      })
      .catch(error => {
        return Promise.reject(error instanceof Error ? error : new Error(String(error)));
      });
  }, [fetchWithInterceptor, token, username]);

  const getCollectionByOwnerAndName = useCallback(async (ownerId: string, collectionName: string) => {
    return fetchWithInterceptor(`${COLLECTIONS_BASE_PATH}/${ownerId}/${collectionName}`, {
      method: 'GET',
      headers: basicHeaders,
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          return Promise.reject(new Error(data.error));
        }
        return data;
      })
      .catch(async error => {
        const body = await (error as Response).json().catch(() => ({}));
        return Promise.reject(body as Error);
      });
  }, [fetchWithInterceptor, basicHeaders]);

  const downloadCollection = useCallback(async (owner: string, collectionName: string) => {
    return fetchWithInterceptor(`${COLLECTIONS_BASE_PATH}/${owner}/${collectionName}/download`, {
      method: 'GET',
      headers: basicHeaders,
    })
      .then(async response => {
        if (!response.ok) {
          return Promise.reject(new Error('Error downloading collection'));
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = collectionName + '.zip';
        a.click();

        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(async error => {
        const body = await (error as Response).json().catch(() => ({}));
        return Promise.reject(body as Error);
      });
  }, [fetchWithInterceptor, basicHeaders]);

   
  const updateCollection = useCallback(async (collectionName: string, collectionData: any) => {
    return fetchWithInterceptor(`${COLLECTIONS_BASE_PATH}/${authUser.user!.username}/${collectionName}`, {
      method: 'PUT',
      headers: basicHeaders,
      body: JSON.stringify(collectionData),
    })
      .then(async response => response.json())
      .catch(async error => {
        const body = await (error as Response).json().catch(() => ({}));
        return Promise.reject(body as Error);
      });
  }, [fetchWithInterceptor, basicHeaders, authUser]);

  const deleteCollection = useCallback(async (collectionName: string, deleteCascade: boolean) => {
    return fetchWithInterceptor(`${COLLECTIONS_BASE_PATH}/${authUser.user!.username}/${collectionName}?cascade=${deleteCascade}`, {
      method: 'DELETE',
      headers: basicHeaders
    })
      .then(async response => response.json())
      .catch(async error => {
        const body = await (error as Response).json().catch(() => ({}));
        return Promise.reject(body as Error);
      });
  }, [fetchWithInterceptor, basicHeaders, authUser]);

  return useMemo(() => ({
    getLoggedUserCollections,
    createCollection,
    createBulkCollection,
    getCollectionByOwnerAndName,
    getCollections,
    downloadCollection,
    updateCollection,
    deleteCollection
  }), [
    getLoggedUserCollections,
    createCollection,
    createBulkCollection,
    getCollectionByOwnerAndName,
    getCollections,
    downloadCollection,
    updateCollection,
    deleteCollection,
  ]);
}
