import { useEffect, useRef, useState } from 'react';
import { usePricingsApi } from '../../api/pricingsApi';
import customAlert from '../../../core/utils/custom-alert';
import { Box } from '@mui/material';
import { flex } from '../../../core/theme/css';
import ConfigurationSpaceGrid from '../configuration-space-grid';
import BanterLoader from '../../../core/components/loaders/banter-loader';

export interface ConfigurationSpace {
  selectedPlan?: string;
  selectedAddons: string[];
  subscriptionFeatures: string[];
  subscriptionUsageLimits: string[];
}

export default function ConfigurationSpaceView({ pricingId }: { pricingId: string }) {
  const [renderedConfigurationSpace, setRenderedConfigurationSpace] = useState<
    ConfigurationSpace[]
  >([]);
  const [renderedConfigurationSpaceSize, setRenderedConfigurationSpaceSize] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(50);

  const { getConfigurationSpace } = usePricingsApi();
  const loaderRef = useRef<HTMLDivElement>(null);
    // Ref para almacenar la altura del documento antes de cargar nuevos elementos
    const prevScrollHeightRef = useRef<number>(0);

  // Obtiene el espacio de configuración cada vez que cambian pricingId, limit u offset
  useEffect(() => {
    getConfigurationSpace(pricingId, limit, offset)
      .then(responseData => {
        const newConfigurationSpace = renderedConfigurationSpace.concat(responseData.configurationSpace);
        setRenderedConfigurationSpace(newConfigurationSpace);
        setRenderedConfigurationSpaceSize(responseData.configurationSpaceSize);
        setLoading(false);
      })
      .catch(error => {
        customAlert(`Error fetching configuration space: ${error}`);
      });
  }, [pricingId, limit, offset]);

  // Ajusta el scroll después de renderizar nuevos elementos
  useEffect(() => {
    if (offset > 0 && !loading) {
      const newScrollHeight = document.documentElement.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeightRef.current;
      // Aumenta el scroll en la diferencia de altura para mantener la posición actual
      window.scrollTo({ top: window.pageYOffset + scrollDiff, behavior: 'auto' });
    }
  }, [renderedConfigurationSpace, offset, loading]);

  // IntersectionObserver para disparar la carga de más elementos al llegar al final
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading) {
        // Guarda la altura actual del documento antes de cargar nuevos elementos
        prevScrollHeightRef.current = document.documentElement.scrollHeight;
        // Incrementamos el offset para obtener la siguiente "página"
        setOffset(prevOffset => prevOffset + limit);
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loading, limit]);

  return (
    <Box sx={{ padding: 2, margin: 'auto', ...flex({ direction: 'column' }), width: '100%' }}>
      {loading ? (
        <Box sx={{ marginTop: 10 }}>
          <BanterLoader />
        </Box>
      ) : (
        <>
          <ConfigurationSpaceGrid configurationSpace={renderedConfigurationSpace} />
          {!(renderedConfigurationSpace.length >= renderedConfigurationSpaceSize) && (
            <Box sx={{ marginTop: 10 }} ref={loaderRef}>
              <BanterLoader />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
