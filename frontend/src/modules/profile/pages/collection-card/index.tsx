import { Helmet } from 'react-helmet';
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import { Favorite, LibraryAdd, LibraryAddCheck, FavoriteBorder } from '@mui/icons-material';
// import PricingTree from '../../components/pricing-tree';
import { PricingRenderer } from '../../../pricing-editor/components/pricing-renderer';
import { Pricing, retrievePricingFromYaml } from 'pricing4ts';
import { AnalyticsDataEntry } from '../../../../assets/data/analytics';
import { usePathname } from '../../../core/hooks/usePathname';
import { useRouter } from '../../../core/hooks/useRouter';
import CollectionStats from '../../components/collection-stats';
import CollectionAnalytics from '../../components/collection-analytics';
// import Harvey from '../../../pricing/components/harvey';
import CollectionAnalyticsModal from '../../components/collection-analytics-modal';
import { usePricingsApi } from '../../../pricing/api/pricingsApi';
import { usePricingCollectionsApi } from '../../api/pricingCollectionsApi';
import { Collection } from '../../types/collection';

export const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: '4px',
}));

export default function CollectionCardPage() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [oldestPricingDate, setOldestPricingDate] = useState<string | null>(null);

  const pathname = usePathname();
  const { getCollectionByOwnerAndName } = usePricingCollectionsApi();
  const router = useRouter();

  useEffect(() => {
    let name = pathname.split('/').pop() as string;
    let ownerId = pathname.split('/')[pathname.split('/').length - 2] as string;

    getCollectionByOwnerAndName(ownerId, name).then(collection => {
      if (collection) {
        setCollection(collection);
        // setOldestPricingDate(oldestPricing.extractionDate);
      } else {
        router.push('/error');
      }
    });
  }, []);

  // useEffect(() => {
  //   if (currentPricing === null) {
  //     return;
  //   }

  //   let pricingYamlPath = currentPricing.yaml;

  //   fetch(pricingYamlPath).then(async response => {
  //     let p: string = '';
  //     p = await response.text();

  //     const parsedPricing: Pricing = retrievePricingFromYaml(p);
  //     setPricing(parsedPricing);
  //   });
  // }, [pricingData, currentPricing]);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  return (
    <>
      <Helmet>
        <title> {`SPHERE - ${collection?.name} Collection`} </title>
      </Helmet>
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" flexDirection="column">
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h5" letterSpacing={1}>
                  <Box component="span" sx={{ color: 'text.secondary', mr: 0.25 }}>
                    {collection?.owner.username}
                  </Box>
                  <Box component="span" sx={{ color: 'text.secondary', mr: 0.25 }}>
                    /
                  </Box>
                  {collection?.name}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={isLiked ? <Favorite /> : <FavoriteBorder />}
                  onClick={() => setIsLiked(!isLiked)}
                  sx={{ mr: 1 }}
                >
                  {isLiked ? '151' : '150'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={isFollowing ? <LibraryAddCheck /> : <LibraryAdd />}
                  size="small"
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              </Box>

              {/* <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              <StyledChip label="Productivity" variant="outlined" />
              <StyledChip label="Freemium" variant="outlined" />
              <StyledChip label="Microsoft" variant="outlined" />
              <StyledChip label="+1M users" variant="outlined" />
              <StyledChip label="USD" variant="outlined" />
              <StyledChip label="USA" variant="outlined" />
            </Box>

            <Typography variant="body2" color="text.secondary" mb={2}>
              More info
            </Typography> */}
            </Box>
          </Box>
        </Box>

        <Box display="flex" gap={4} sx={{ mb: 4 }}>
          <Box flex={1} sx={{ maxWidth: '66.7%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Description
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              {collection?.description ? collection.description : 'This collection has no description.'}
            </Typography>
            {/* {collection && (<></>)} */}
          </Box>

          <Box sx={{ minWidth: '33.3%' }}>
            {collection && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <CollectionStats collection={collection} />
              </Paper>
            )}

            {collection && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <CollectionAnalytics collectionData={collection.analytics} toggleModal={toggleModal} />
              </Paper>
            )}
            {/* <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Harvey />
            </Paper> */}
          </Box>
        </Box>
      </Container>

      <CollectionAnalyticsModal
        open={isModalOpen}
        onClose={toggleModal}
        collectionData={collection?.analytics}
      />
    </>
  );
}
