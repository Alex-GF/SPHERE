import { Box } from '@mui/material';
import { flex } from '../../../../../core/theme/css';
import { primary } from '../../../../../core/theme/palette';

export default function FlagGrid({ data }: { data: string[] }) {
  return (
    <Box sx={{ ...flex({ justify: 'space-evenly', align: 'center' }), flexWrap: 'wrap', gap: 2, mt: 2 }}>
      {data.map((item, index) => (
        <Box
          key={index}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: primary[700],
            padding: '10px 20px',
            color: primary[700],
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: primary[700],
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
            },
          }}
        >
          {item}
        </Box>
      ))}
    </Box>
  );
}
