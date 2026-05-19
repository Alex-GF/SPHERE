import { useLocation } from 'react-router-dom';
import { useRouter } from '../../../core/hooks/useRouter';
import FloatingMorphHeader from '../../pages/home/components/floating-morph-header';
import FullFooterSection from '../../pages/home/components/full-footer-section';
import SunsetStripeBand from '../../../core/components/sunset-stripe';
import { NAV_ITEMS } from '../../pages/home/data';
import ImportPricingModal from '../../../core/components/import-pricing-modal';
import Alerts from '../../../core/components/alerts';
import { useEffect, useState } from 'react';
import { usePricingsApi } from '../../../pricing/api/pricingsApi';
import { retrievePricingFromYaml } from 'pricing4ts';

export default function PublicLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const router = useRouter();
  const isLanding = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { createPricing } = usePricingsApi();

  useEffect(() => {
    const handleOpenUploadModal = () => {
      setUploadModalOpen(true);
    };

    window.addEventListener('open-upload-pricing-modal', handleOpenUploadModal);
    return () => {
      window.removeEventListener('open-upload-pricing-modal', handleOpenUploadModal);
    };
  }, []);

  const handleCloseUploadModal = () => {
    setUploadModalOpen(false);
  };

  const handleUploadSubmit = (file: File) => {
    file.text().then(text => {
      try {
        const uploadedPricing = retrievePricingFromYaml(text);
        setErrors([]);
        const formData = new FormData();
        formData.append('saasName', uploadedPricing.saasName);
        formData.append('version', uploadedPricing.version);
        formData.append('yaml', file);
        formData.append('private', 'false');
        createPricing(formData, setErrors).then(() => {
          setUploadModalOpen(false);
        }).catch((error) => {
          console.error('Error creating pricing:', error);
        });
      } catch (e) {
        setErrors([(e as Error).message]);
      }
    });
  };

  const handleNavigate = (to: string) => router.push(to);

  if (isLanding || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-tp-canvas">
      <FloatingMorphHeader navItems={NAV_ITEMS} onNavigate={handleNavigate} />

      <main className="flex-1 pt-24 pb-16">
        {children}
      </main>

      <SunsetStripeBand />
      <FullFooterSection onNavigate={handleNavigate} />

      <ImportPricingModal
        modalState={uploadModalOpen}
        handleClose={handleCloseUploadModal}
        onSubmit={handleUploadSubmit}
      />
      <Alerts messages={errors} />
    </div>
  );
}
