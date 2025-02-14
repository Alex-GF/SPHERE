import { Helmet } from 'react-helmet';
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Typography,
  styled,
} from '@mui/material';
import { Favorite, LibraryAdd, LibraryAddCheck, FavoriteBorder } from '@mui/icons-material';
import { usePathname } from '../../../core/hooks/usePathname';
import { useRouter } from '../../../core/hooks/useRouter';
import CollectionStats from '../../components/collection-stats';
import CollectionAnalytics from '../../components/collection-analytics';
import CollectionAnalyticsModal from '../../components/collection-analytics-modal';
import { usePricingCollectionsApi } from '../../../profile/api/pricingCollectionsApi';
import { Collection } from '../../types/collection';
import { PricingsGrid } from '../../../pricing/pages/list';
import PricingListCard from '../../../pricing/components/pricing-list-card';

export const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: '4px',
}));

export default function CollectionCardPage() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collection, setCollection] = useState<Collection | null>(null);

  const pathname = usePathname();
  const { getCollectionByOwnerAndName } = usePricingCollectionsApi();
  const router = useRouter();

  useEffect(() => {
    let name = pathname.split('/').pop() as string;
    let ownerId = pathname.split('/')[pathname.split('/').length - 2];

    getCollectionByOwnerAndName(ownerId, name).then(collection => {
      if (collection) {
        setCollection(collection);
      } else {
        router.push('/error');
      }
    });
  }, []);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
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
              {collection?.description
                ? collection.description
                : 'This collection has no description.'}
            </Typography>
            {collection && (
              <>
                <Typography variant="h6" fontWeight="bold" marginBottom={-2}>
                  Pricings in Collection
                </Typography>
                <PricingsGrid
                  sx={{
                    height: '100%',
                    maxHeight: 800,
                    overflowY: 'scroll',
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    padding: '20px 0',
                  }}
                >
                  {collection.pricings[0].pricings.length > 0 ? (
                    Object.values(collection.pricings[0].pricings).map((pricing) => {
                      return (
                        <PricingListCard
                          key={pricing.name}
                          name={pricing.name}
                          owner={pricing.owner}
                          dataEntry={pricing}
                        />
                      );
                    })
                  ) : (
                    <Box>No pricings found</Box>
                  )}
                </PricingsGrid>
              </>
            )}
          </Box>

          <Box sx={{ minWidth: '33.3%' }}>
            {collection && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <CollectionStats collection={collection} />
              </Paper>
            )}

            {collection && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <CollectionAnalytics
                  collectionData={collection.analytics}
                  toggleModal={toggleModal}
                />
              </Paper>
            )}
            {/* <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Harvey />
            </Paper> */}
          </Box>
        </Box>
      </Container>

      {collection && (
        <CollectionAnalyticsModal
          open={isModalOpen}
          onClose={toggleModal}
          collectionData={collection.analytics}
        />
      )}
    </>
  );
}
