import { useAuth } from '../../auth/hooks/useAuth';
import { FilterValues } from '../pages/list';

export const PRICINGS_BASE_PATH = import.meta.env.VITE_API_URL + '/pricings';

export function usePricingsApi() {
  const { fetchWithInterceptor, authUser } = useAuth();

  const basicHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authUser.token}`,
  };

  const getPricings = async (filters: Record<string, string | FilterValues> = {}) => {
    
    let requestUrl;

    if (Object.keys(filters).length === 0){
      requestUrl = `${PRICINGS_BASE_PATH}`;
    }else{
      const filterParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (typeof value[0] === 'number') {
            if(value[0]) filterParams.append("min-" + key.replace("Range", ""), value[0].toString());
            if(value[1]) filterParams.append("max-" + key.replace("Range", ""), value[1].toString());
          }else if(typeof value[0] === 'string'){
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
        if (!response.ok){
          return Promise.reject(response);
        }else{
          return response.json()
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  };

  const getPricingByName = async (name: string, owner: string, collectionName: string | null) => {
    return fetch(`${PRICINGS_BASE_PATH}/${owner}/${name}${collectionName && collectionName !== "undefined" ? `?collectionName=${collectionName}` : ""}`, {
      method: 'GET',
      headers: basicHeaders,
    })
      .then(response => {
        if (!response.ok){
          return Promise.reject(response);
        }else{
          return response.json()
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  };

  const getLoggedUserPricings = async () => {
    return fetchWithInterceptor(`${import.meta.env.VITE_API_URL}/me/pricings`, {
      method: 'GET',
      headers: basicHeaders,
    })
      .then(response => {
        if (!response.ok){
          return Promise.reject(response);
        }else{
          return response.json()
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }

  const createPricing = async (formData: FormData, setErrors: Function = () => {}) => {
    return fetchWithInterceptor(PRICINGS_BASE_PATH, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authUser.token}`,
      },
      body: formData,
    })
      .then(async response => {
        const parsedResponse = await response.json()
        
        if (!response.ok) {
          throw new Error(parsedResponse.error);
        }

        return parsedResponse;
      })
      .catch((error: Error) => {
        setErrors([error.message]);
      });
  };

  const addPricingToCollection = async (pricingName: string, collectionId: string) => {
    return fetchWithInterceptor(`${import.meta.env.VITE_API_URL}/me/pricings`, {
      method: 'PUT',
      headers: basicHeaders,
      body: JSON.stringify({ pricingName, collectionId }),
    })
      .then(response => {
        if (!response.ok){
          return Promise.reject(response);
        }else{
          return response.json()
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }

  const updatePricing = (pricingName: string, pricingData: any) => {
    return fetchWithInterceptor(`${PRICINGS_BASE_PATH}/${authUser.user?.username}/${pricingName}`, {
      method: 'PUT',
      headers: basicHeaders,
      body: JSON.stringify(pricingData),
    })
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response);
        }else{
          return response.json()
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }

  const removePricingVersion = async (pricingName: string, pricingVersion: string) => {
    return fetchWithInterceptor(`${PRICINGS_BASE_PATH}/${authUser.user?.username}/${pricingName}/${pricingVersion}`, {
      method: 'DELETE',
      headers: basicHeaders,
    })
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response);
        }else{
          return response.json()
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }

  const removePricingFromCollection = async (pricingName: string) => {
    return fetchWithInterceptor(`${import.meta.env.VITE_API_URL}/me/collections/pricings/${pricingName}`, {
      method: 'DELETE',
      headers: basicHeaders,
    })
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response);
        }else{
          return response.json()
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }

  const removePricingByName = async (name: string) => {
    return fetchWithInterceptor(`${PRICINGS_BASE_PATH}/${authUser.user?.username}/${name}`, {
      method: 'DELETE',
      headers: basicHeaders,
    })
      .then(async response => {
        if (!response.ok) {
          return Promise.reject(response);
        }else{
          return response.json()
        }
      })
      .catch(error => {
        return Promise.reject(error as Error);
      });
  }

  return { getPricings, getPricingByName, getLoggedUserPricings, createPricing, addPricingToCollection, removePricingFromCollection, removePricingByName, updatePricing, removePricingVersion };
}
