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

    return fetchWithInterceptor(requestUrl as string, {
      method: 'GET',
      headers: basicHeaders,
    })
      .then(response => response.json())
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return { getPricings };
}
