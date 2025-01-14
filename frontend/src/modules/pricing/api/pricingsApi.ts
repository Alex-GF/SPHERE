import { useAuth } from '../../auth/hooks/useAuth';

export const PRICINGS_BASE_PATH = import.meta.env.VITE_API_URL + '/pricings';

export function usePricingsApi() {
  const { fetchWithInterceptor, authUser } = useAuth();

  const basicHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authUser.token}`,
  };

  const getPricings = async () => {
    return fetchWithInterceptor(`${PRICINGS_BASE_PATH}`, {
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
