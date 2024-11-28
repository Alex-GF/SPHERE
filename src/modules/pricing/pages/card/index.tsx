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
import PricingTree from '../../components/pricing-tree';
import { PricingRenderer } from '../../../pricing-editor/components/pricing-renderer';
import { Pricing, retrievePricingFromYaml } from 'pricing4ts';
import FileExplorer from '../../components/file-explorer';
import { SAAS_DATA, AnalyticsDataEntry } from '../../../../assets/data/analytics';
import { usePathname } from '../../../core/hooks/usePathname';
import { useQueryParams } from '../../../core/hooks/useQueryParams';
import { useRouter } from '../../../core/hooks/useRouter';
import Stats from '../../components/stats';
import Analytics from '../../components/analytics';
import Harvey from '../../components/harvey';
import AnalyticsModal from '../../components/analyticsModal';

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: '4px',
}));

export const CURRENCIES = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
};

export default function CardPage() {
  const [tabValue, setTabValue] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [fullPricingData, setFullPricingData] = useState<AnalyticsDataEntry[] | null>(null);
  const [pricingData, setPricingData] = useState<AnalyticsDataEntry[] | null>(null);
  const [currentPricing, setCurrentPricing] = useState<AnalyticsDataEntry | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [oldestPricingDate, setOldestPricingDate] = useState<string | null>(null);
  const [pricingDetails, setPricingDetails] = useState<{ size: string; lastModified: string }>({
    size: 'Unknown size',
    lastModified: 'Unknown modification date',
  });

  const pathname = usePathname();
  const router = useRouter();
  const queryParams = useQueryParams();

  useEffect(() => {
    let name = queryParams.get('name') ?? '';

    if (name in SAAS_DATA) {
      setFullPricingData(SAAS_DATA[name]);
      setPricingData(SAAS_DATA[name]);
      setCurrentPricing(SAAS_DATA[name][0]);
      setOldestPricingDate(SAAS_DATA[name][SAAS_DATA[name].length - 1].date);
    } else {
      router.push('/error');
    }
  }, [pathname]);

  useEffect(() => {
    if (currentPricing === null) {
      return;
    }

    let pricingYamlPath = currentPricing.yaml_path;

    fetch('src/assets/' + pricingYamlPath).then(async response => {
      let p: string = '';
      p = await response.text();

      const contentLength = response.headers.get('content-length')
        ? parseInt(response.headers.get('content-length') ?? '0')
        : null;
      const lastModified = response.headers.get('last-modified');

      setPricingDetails({
        size: contentLength ? `${(contentLength / 1024).toFixed(2)} KB` : 'Unknown size',
        lastModified: lastModified
          ? new Date(lastModified).toLocaleString()
          : 'Unknown modification date',
      });

      const parsedPricing: Pricing = retrievePricingFromYaml(p);
      setPricing(parsedPricing);
    });
  }, [pricingData]);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const handleInputDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPricingData = fullPricingData?.filter(
      entry => new Date(entry.date) >= new Date(e.target.value)
    );
    if (newPricingData) {
      setPricingData(newPricingData);
    } else {
      setPricingData([]);
    }
  };

  const handleOutputDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPricingData = fullPricingData?.filter(
      entry => new Date(entry.date) <= new Date(e.target.value)
    );
    if (newPricingData) {
      setPricingData(newPricingData);
    } else {
      setPricingData([]);
    }
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPricing = pricingData?.find(entry => entry.yaml_path == e.target.value);
    if (newPricing) {
      setCurrentPricing(newPricing);
    }
  };

  return (
    <>
      <Helmet>
        <title> {`SPHERE - ${pricing?.saasName} Pricing`} </title>
      </Helmet>
      <Container maxWidth="xl">
        <Box sx={{ my: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" flexDirection="column">
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h5" letterSpacing={1}>
                  <Box component="span" sx={{ color: 'text.secondary', mr: 0.25 }}>
                    sphere
                  </Box>
                  <Box component="span" sx={{ color: 'text.secondary', mr: 0.25 }}>
                    /
                  </Box>
                  {pricing?.saasName}
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

              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                  <Tab label="Pricing card" />
                  <Tab label="Files and versions" />
                </Tabs>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" gap={2}>
                {oldestPricingDate && (
                  <>
                    <TextField
                      label="Start Date"
                      type="date"
                      fullWidth
                      defaultValue={new Date(oldestPricingDate).toISOString().split('T')[0]}
                      slotProps={{ inputLabel: { shrink: true } }}
                      onChange={handleInputDate}
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      onChange={handleOutputDate}
                    />
                  </>
                )}
              </Box>
              <TextField
                label="Version"
                select
                fullWidth
                slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
                onChange={handleVersionChange}
              >
                {pricingData?.map((entry, index) => (
                  <option key={index} value={entry.yaml_path}>
                    {entry.yaml_path.split('/')[entry.yaml_path.split('/').length - 1]}
                  </option>
                ))}
              </TextField>
            </Box>
          </Box>
        </Box>

        <Box display="flex" gap={4} sx={{ mb: 4 }}>
          {tabValue === 1 ? (
            pricingData && <FileExplorer pricingData={pricingData} />
          ) : (
            <>
              <Box flex={1}>
                <Typography variant="h6" gutterBottom>
                  Pricing Information
                </Typography>
                <Typography variant="body1" paragraph>
                  GitHub is where over 73 million developers shape the future of software, together.
                  Contribute to the open source community, manage your Git repositories, review code
                  like a pro, track bugs and features, power your CI/CD and DevOps workflows, and
                  secure code before you commit it.
                </Typography>
                {pricing && <PricingRenderer pricing={pricing} errors={[]} />}
              </Box>

              <Box sx={{ minWidth: '33.3%' }}>
                {currentPricing && pricing && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Stats
                      pricingDetails={pricingDetails}
                      currentPricing={currentPricing}
                      pricing={pricing}
                    />
                  </Paper>
                )}

                {pricingData && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Analytics pricingData={pricingData} toggleModal={toggleModal} />
                  </Paper>
                )}
                {/* <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Harvey />
            </Paper> */}

                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <PricingTree pricing={currentPricing} name={pricing?.saasName} />
                </Paper>
              </Box>
            </>
          )}
        </Box>
      </Container>

      <AnalyticsModal open={isModalOpen} onClose={toggleModal} pricingData={pricingData!} />
    </>
  );
}
