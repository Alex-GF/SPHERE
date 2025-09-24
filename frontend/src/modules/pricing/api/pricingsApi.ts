import { useCallback, useMemo } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { FilterValues } from '../pages/list';

export const PRICINGS_BASE_PATH = import.meta.env.VITE_API_URL + '/pricings';

export function usePricingsApi() {
  const { fetchWithInterceptor, authUser } = useAuth();
  const token = authUser?.token;
  const username = authUser?.user?.username;

  const basicHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const getPricings = useCallback(async (filters: Record<string, string | FilterValues | number> = {}) => {
    let requestUrl;

    if (Object.keys(filters).length === 0) {
      requestUrl = `${PRICINGS_BASE_PATH}`;
    } else {
      const filterParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        // handle numeric pagination params
        if (key === 'limit' || key === 'offset') {
          if (value !== undefined && value !== null) filterParams.append(key, String(value));
          return;
        }
        if (Array.isArray(value)) {
          if (typeof value[0] === 'number') {
            if (value[0])
              filterParams.append('min-' + key.replace('Range', ''), value[0].toString());
            if (value[1])
              filterParams.append('max-' + key.replace('Range', ''), value[1].toString());
          } else if (typeof value[0] === 'string') {
            const selectedOwners = value as string[];

            const owners = selectedOwners.join(',');
            filterParams.append(key, owners);
          }
        } else {
          const stringValue = value as string;

          if (stringValue.trim().length > 0) filterParams.append(key, value as string);
        }
      });
      requestUrl = `${PRICINGS_BASE_PATH}?${filterParams.toString()}`;
    }

    return fetch(requestUrl as string, {
      method: 'GET',
      headers: basicHeaders,
    })
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response);
        } else {
          return response.json();
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }, [basicHeaders]);

  const getPricingByName = useCallback(async (name: string, owner: string, collectionName: string | null) => {
    return fetch(
      `${PRICINGS_BASE_PATH}/${owner}/${name}${
        collectionName && collectionName !== 'undefined' ? `?collectionName=${collectionName}` : ''
      }`,
      {
        method: 'GET',
        headers: basicHeaders,
      }
    )
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response);
        } else {
          return response.json();
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }, [basicHeaders]);

  const getLoggedUserPricings = useCallback(async () => {
    return fetchWithInterceptor(`${import.meta.env.VITE_API_URL}/me/pricings`, {
      method: 'GET',
      headers: basicHeaders,
    })
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response);
        } else {
          return response.json();
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }, [fetchWithInterceptor, basicHeaders]);

  const getConfigurationSpace = useCallback(async (pricingId: string, limit?: number, offset?: number) => {
    
    const params = new URLSearchParams();

    if (limit !== undefined) params.set('limit', limit.toString());
    if (offset !== undefined) params.set('offset', offset.toString());

    const queryString = params.toString(); 
    
    return fetchWithInterceptor(
      `${PRICINGS_BASE_PATH}/${pricingId}/configuration-space${queryString ? `?${queryString}` : ''}`,
      {
        method: 'GET',
        headers: basicHeaders,
      }
    )
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          return Promise.reject(data.error);
        } else {
          return data;
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }, [fetchWithInterceptor, basicHeaders]);

  const createPricing = useCallback(async (formData: FormData, setErrors: (errors: string[]) => void = () => {}) => {
    return fetchWithInterceptor(PRICINGS_BASE_PATH, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then(async response => {
        const parsedResponse = await response.json();

        if (!response.ok) {
          throw new Error(parsedResponse.error);
        }

        return parsedResponse;
      })
      .catch((error: Error) => {
        setErrors([error.message]);
      });
  }, [fetchWithInterceptor, token]);

  const addPricingToCollection = useCallback(async (pricingName: string, collectionId: string) => {
    return fetchWithInterceptor(`${import.meta.env.VITE_API_URL}/me/pricings`, {
      method: 'PUT',
      headers: basicHeaders,
      body: JSON.stringify({ pricingName, collectionId }),
    })
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response);
        } else {
          return response.json();
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }, [fetchWithInterceptor, basicHeaders]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePricing = useCallback((pricingName: string, pricingData: any) => {
    return fetchWithInterceptor(`${PRICINGS_BASE_PATH}/${username}/${pricingName}`, {
      method: 'PUT',
      headers: basicHeaders,
      body: JSON.stringify(pricingData),
    })
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response);
        } else {
          return response.json();
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }, [fetchWithInterceptor, basicHeaders, username]);

  const updateClientPricingVersion = useCallback(async (pricingString: string) => {
    return fetchWithInterceptor(`${PRICINGS_BASE_PATH}`, {
      method: 'PUT',
      headers: basicHeaders,
      body: JSON.stringify({pricing: pricingString}),
    })
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response);
        } else {
          return response.json();
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }, [fetchWithInterceptor, basicHeaders]);

  const removePricingVersion = useCallback(async (pricingName: string, pricingVersion: string) => {
    return fetchWithInterceptor(
      `${PRICINGS_BASE_PATH}/${username}/${pricingName}/${pricingVersion}`,
      {
        method: 'DELETE',
        headers: basicHeaders,
      }
    )
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response);
        } else {
          return response.json();
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }, [fetchWithInterceptor, basicHeaders, username]);

  const removePricingFromCollection = useCallback(async (pricingName: string) => {
    return fetchWithInterceptor(
      `${import.meta.env.VITE_API_URL}/me/collections/pricings/${pricingName}`,
      {
        method: 'DELETE',
        headers: basicHeaders,
      }
    )
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response);
        } else {
          return response.json();
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }, [fetchWithInterceptor, basicHeaders]);

  const removePricingByName = useCallback(async (name: string, collectionName?: string) => {
    return fetchWithInterceptor(
      `${PRICINGS_BASE_PATH}/${username}/${name}${
        collectionName ? `?collectionName=${collectionName}` : ''
      }`,
      {
        method: 'DELETE',
        headers: basicHeaders,
      }
    )
      .then(async response => response.json())
      .then(data => {
        if (data.error) {
          return Promise.reject(data.error);
        } else {
          return data;
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }, [fetchWithInterceptor, basicHeaders, username]);

  return useMemo(
    () => ({
      getPricings,
      getPricingByName,
      getLoggedUserPricings,
      getConfigurationSpace,
      createPricing,
      addPricingToCollection,
      removePricingFromCollection,
      removePricingByName,
      updatePricing,
      updateClientPricingVersion,
      removePricingVersion,
    }),
    [
      getPricings,
      getPricingByName,
      getLoggedUserPricings,
      getConfigurationSpace,
      createPricing,
      addPricingToCollection,
      removePricingFromCollection,
      removePricingByName,
      updatePricing,
      updateClientPricingVersion,
      removePricingVersion,
    ]
  );
}
