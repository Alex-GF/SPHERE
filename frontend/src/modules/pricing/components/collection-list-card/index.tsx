import { Box, Typography } from '@mui/material';
import { FaFolder } from 'react-icons/fa';
import { useRouter } from '../../../core/hooks/useRouter';
import { flex } from '../../../core/theme/css';
import { CollectionEntry } from '../../../profile/types/profile-types';

export default function CollectionListCard({ collection }: { collection: CollectionEntry }) {
  const router = useRouter();

  return (
    <Box
      sx={{
        border: '1px solid #ddd',
        borderRadius: 2,
        p: 2,
        ...flex({ direction: 'column' }),
        width: '200px',
        cursor: 'pointer',
      }}
      key={`collection-${collection.name}`}
      onClick={() => router.push(`/pricings/collections/${collection.owner.id}/${collection.name}`)}
    >
      <FaFolder fontSize={100} />
      <Typography variant="subtitle1">{collection.name}</Typography>
      <Typography variant="body2" color="text.secondary">
        {collection.numberOfPricings} pricings
        {/* · Updated Jun 29, 2023 · 105 descargas */}
      </Typography>
    </Box>
  );
}
