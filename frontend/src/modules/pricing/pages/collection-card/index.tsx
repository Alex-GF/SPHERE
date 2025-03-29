import { Helmet } from 'react-helmet';
import { useEffect, useState, useMemo } from 'react';
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
  IconButton,
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
import { useAuth } from '../../../auth/hooks/useAuth';
import CollectionSettings from '../../components/collection-settings';
import { FaSortAlphaDown, FaSortAlphaUpAlt } from 'react-icons/fa';
import { primary } from '../../../core/theme/palette';

export const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: '4px',
}));

export default function CollectionCardPage() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collection, setCollection] = useState<Collection | undefined>(undefined);
  const [startDate, setStartDate] = useState<string | null>(new Date().toISOString());
  const [endDate, setEndDate] = useState<string | null>(new Date().toISOString());
  const [tabValue, setTabValue] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const pathname = usePathname();
  const { getCollectionByOwnerAndName, downloadCollection } = usePricingCollectionsApi();
  const router = useRouter();
  const { authUser } = useAuth();

  useEffect(() => {
    const segments = pathname.split('/');
    const name = segments.pop() as string;
    const ownerId = segments[segments.length - 1];

    getCollectionByOwnerAndName(ownerId, name)
      .then(collection => {
        if (collection) {
          setCollection(collection);
          if (collection.analytics) {
            setStartDate(collection.analytics.evolutionOfPlans.dates[0]);
            setEndDate(
              collection.analytics.evolutionOfPlans.dates[
                collection.analytics.evolutionOfPlans.dates.length - 1
              ]
            );
          }
        } else {
          router.push('/error');
        }
      })
      .catch(error => {
        console.log(error);
        // router.push('/error');
      });
  }, [pathname, router]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleInputDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(new Date(e.target.value).toISOString());
  };

  const handleOutputDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(new Date(e.target.value).toISOString());
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedPricings = useMemo(() => {
    if (!collection || !collection.pricings || collection.pricings.length === 0) {
      return [];
    }
    // Convertir el objeto a un array
    const pricingArray = Object.values(collection.pricings[0].pricings) as any[];
    return pricingArray.sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }, [collection, sortOrder]);

  return (
    <>
      <Helmet>
        <title>{`SPHERE - ${collection?.name} Collection`}</title>
      </Helmet>
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" flexDirection="column">
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h5" letterSpacing={1}>
                  {/* <Box component="span" sx={{ color: 'text.secondary', mr: 0.25 }}>
                    {collection?.owner.username}
                  </Box>
                  <Box component="span" sx={{ color: 'text.secondary', mr: 0.25 }}>
                    /
                  </Box> */}
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

              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                  <Tab label="Collection card" />
                  {collection &&
                    authUser.user &&
                    collection.owner.username === authUser.user.username && (
                      <Tab label="Settings" />
                    )}
                </Tabs>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" gap={2}>
                {collection &&
                  collection.analytics &&
                  collection.analytics.evolutionOfPlans.dates.length > 0 && (
                    <>
                      <TextField
                        label="Start Date"
                        type="date"
                        fullWidth
                        defaultValue={
                          new Date(collection.analytics.evolutionOfPlans.dates[0])
                            .toISOString()
                            .split('T')[0]
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                        onChange={handleInputDate}
                      />
                      <TextField
                        label="End Date"
                        type="date"
                        fullWidth
                        defaultValue={new Date().toISOString().split('T')[0]}
                        slotProps={{ inputLabel: { shrink: true } }}
                        onChange={handleOutputDate}
                      />
                    </>
                  )}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box display="flex" gap={4} sx={{ mb: 4 }}>
          {tabValue === 1 && collection && (
            <CollectionSettings collection={collection} updateCollectionMethod={setCollection} />
          )}
          {tabValue === 0 && (
            <>
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
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" mb={-2}>
                        <Typography variant="h6" fontWeight="bold">
                          Pricings in Collection
                        </Typography>
                        <IconButton onClick={toggleSortOrder} size="medium">
                          {sortOrder === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUpAlt />}
                        </IconButton>
                      </Box>
                      <Button
                        sx={{
                          border: `1px solid ${primary[400]}`,
                          color: `${primary[400]}`,
                          width: 150,
                          height: 40,
                          fontSize: 16,
                          fontWeight: 'bold',
                          marginBottom: -2,
                          '&:hover': {
                            backgroundColor: primary[400],
                            color: 'white',
                          },
                        }}
                        onClick={() =>
                          downloadCollection(
                            collection?.owner.id as string,
                            collection?.name as string
                          )
                        }
                      >
                        DOWNLOAD
                      </Button>
                    </Box>
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
                      {sortedPricings.length > 0 ? (
                        sortedPricings.map((pricing: any) => {
                          const ownerName = pricing.owner || '';
                          return (
                            <PricingListCard
                              key={pricing.name}
                              name={pricing.name}
                              owner={ownerName}
                              dataEntry={pricing}
                              showOptions
                            />
                          );
                        })
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 2,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                          }}
                        >
                          NO PRICINGS FOUND
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => router.push('/me/pricings')}
                          >
                            Add
                          </Button>
                        </Box>
                      )}
                    </PricingsGrid>
                  </>
                )}
              </Box>

              <Box sx={{ minWidth: '33.3%' }}>
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <CollectionStats collection={collection} />
                </Paper>

                {collection && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <CollectionAnalytics
                      collectionData={collection.analytics}
                      toggleModal={toggleModal}
                      startDate={startDate}
                      endDate={endDate}
                    />
                  </Paper>
                )}
              </Box>
            </>
          )}
        </Box>
      </Container>

      {collection && (
        <CollectionAnalyticsModal
          open={isModalOpen}
          onClose={toggleModal}
          collectionData={collection.analytics}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </>
  );
}
