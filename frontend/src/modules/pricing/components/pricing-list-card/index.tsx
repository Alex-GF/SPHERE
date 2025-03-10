import { Box, Card, CardContent, Menu, MenuItem, Stack, styled, Typography } from '@mui/material';
import { useRouter } from '../../../core/hooks/useRouter';
import { PricingEntry } from '../../pages/list';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { getCurrency } from '../stats';
import { IoMdPricetags } from 'react-icons/io';
import { FaFileInvoiceDollar } from 'react-icons/fa6';
import { MdMoreVert } from 'react-icons/md';
import { grey, primary } from '../../../core/theme/palette';
import { useState } from 'react';
import { usePricingsApi } from '../../api/pricingsApi';
import customAlert from '../../../core/utils/custom-alert';
import customConfirm from '../../../core/utils/custom-confirm';

// const CARD_HEIGHT = 400;
const CARD_HEIGHT = 150;

const StatsDivider = styled(Box)(() => ({
  height: 5,
  width: 5,
  borderRadius: '50%',
  backgroundColor: '#000000',
  margin: '0 10px',
}));

export default function PricingListCard({
  name,
  owner,
  dataEntry,
  showOptions = false,
  setPricingToAdd = () => {},
  setAddToCollectionModalOpen,
}: {
  name: string;
  owner: string;
  dataEntry: PricingEntry;
  showOptions?: boolean;
  setPricingToAdd?: (value: string) => void;
  setAddToCollectionModalOpen?: (value: boolean) => void;
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const { removePricingFromCollection, removePricingByName } = usePricingsApi();

  const handleAddToCollection = () => {
    setAddToCollectionModalOpen ? setAddToCollectionModalOpen(true) : null;
    setPricingToAdd(name);
  };

  const handleRemoveFromCollection = () => {
    customConfirm('Are you sure you want to remove this pricing from the collection?').then(() => {
      removePricingFromCollection(name)
        .then(() => {
          customAlert('Pricing removed from collection');
          window.location.reload();
        })
        .catch(error => {
          console.error(error);
          customAlert('An error occurred while removing the pricing from the collection');
        });
    });
  };

  const handleRemovePricing = () => {
    removePricingByName(name)
      .then(() => {
        customAlert('Pricing removed');
        window.location.reload();
      })
      .catch(error => {
        console.error(error);
        customAlert('An error occurred while removing the pricing');
      });
  };

  const handleOpenOptionsMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseOptionsMenu = () => {
    setAnchorEl(null);
  };

  const router = useRouter();

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        padding: '0 5px',
        width: '100%',
        maxWidth: 600,
        height: CARD_HEIGHT,
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: '0 0 10px 2px', // Box shadow en hover
          boxShadowColor: 'primary.700',
          cursor: 'pointer',
        },
      }}
    >
      {showOptions && (
        <>
          <Box
            sx={{
              position: 'absolute',
              right: 10,
              top: 10,
              height: 40,
              width: 40,
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'background-color 0.3s',
              '&:hover': {
                cursor: 'pointer',
                backgroundColor: `${grey[300]}`,
              },
            }}
            onClick={handleOpenOptionsMenu}
          >
            <MdMoreVert fontSize={30} />
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseOptionsMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {setAddToCollectionModalOpen ? (
              <MenuItem
                onClick={handleAddToCollection}
                sx={{
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: `${grey[300]}`,
                  },
                }}
              >
                <Typography textAlign="center">Add to collection</Typography>
              </MenuItem>
            ) : (
              <MenuItem
                onClick={handleRemoveFromCollection}
                sx={{
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: `${grey[300]}`,
                  },
                }}
              >
                <Typography textAlign="center" color="red">
                  Remove from collection
                </Typography>
              </MenuItem>
            )}
            <MenuItem
              onClick={handleRemovePricing}
              sx={{
                transition: 'background-color 0.3s',
                '&:hover': {
                  backgroundColor: `${grey[300]}`,
                },
              }}
            >
              <Typography textAlign="center" color="red">
                Remove
              </Typography>
            </MenuItem>
          </Menu>
        </>
      )}
      <CardContent>
        <Stack
          justifyContent="center"
          height={45}
          pl="10px"
          onClick={() => router.push(`/pricings/${owner}/${name}?collectionName=${dataEntry.collectionName}`)}
          sx={{
            transition: 'color 0.3s',
            '&:hover': {
              cursor: 'pointer',
              color: `${primary[600]}`,
            },
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
          {dataEntry.collectionName ? `${dataEntry.collectionName}/${name}` : name}
          </Typography>
        </Stack>
        {/* <Box
          sx={{
            position: 'relative',
            maxHeight: 200,
            overflow: 'hidden',
            mt: 1,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="justify"
            sx={{ mt: 1, height: 200 }}
          >
            This is the pricing information for {name}. The pricing version that is currently
            displayed is from {new Date(dataEntry.extractionDate).toLocaleDateString()}. The prices
            are displayed with EUR currency. In future versions, more data will be provided in this
            card.
          </Typography>
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 40,
              backgroundImage:
                'linear-gradient(to bottom, rgba(0, 0, 0, 0.01) 0%, rgba(255, 255, 255, 1) 100%)',
            }}
          />
        </Box> */}
        <Box display="flex" justifyContent="space-evenly" alignItems="center" mt={2}>
          <Box>
            <Typography component="span">Updated </Typography>
            {dataEntry && formatDistanceToNow(parseISO(dataEntry.extractionDate))} ago
          </Box>
          <StatsDivider />
          <Box display="flex" justifyContent="center" alignItems="center">
            <FaFileInvoiceDollar
              fill={grey[700]}
              style={{ height: 18, width: 18, marginRight: 10 }}
            />
            <Typography variant="body1">
              {dataEntry.analytics.configurationSpaceSize} subscriptions
            </Typography>
          </Box>
          <StatsDivider />
          <Box display="flex" justifyContent="between" alignItems="center">
            <IoMdPricetags fill={grey[700]} style={{ height: 20, width: 20, marginRight: 10 }} />

            <Typography variant="body1">
              {dataEntry.analytics.minSubscriptionPrice}
              {getCurrency(dataEntry.currency)} - {dataEntry?.analytics.maxSubscriptionPrice}
              {getCurrency(dataEntry.currency)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
