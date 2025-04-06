import React from 'react';
import { Box } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { primary } from '../../../theme/palette';

// Definición de las animaciones con keyframes
const moveBox1 = keyframes`
  9.09% { transform: translate(-26px, 0); }
  18.18% { transform: translate(0, 0); }
  27.27% { transform: translate(0, 0); }
  36.36% { transform: translate(26px, 0); }
  45.45% { transform: translate(26px, 26px); }
  54.55% { transform: translate(26px, 26px); }
  63.64% { transform: translate(26px, 26px); }
  72.73% { transform: translate(26px, 0); }
  81.82% { transform: translate(0, 0); }
  90.91% { transform: translate(-26px, 0); }
  100% { transform: translate(0, 0); }
`;

const moveBox2 = keyframes`
  9.09% { transform: translate(0, 0); }
  18.18% { transform: translate(26px, 0); }
  27.27% { transform: translate(0, 0); }
  36.36% { transform: translate(26px, 0); }
  45.45% { transform: translate(26px, 26px); }
  54.55% { transform: translate(26px, 26px); }
  63.64% { transform: translate(26px, 26px); }
  72.73% { transform: translate(26px, 26px); }
  81.82% { transform: translate(0, 26px); }
  90.91% { transform: translate(0, 26px); }
  100% { transform: translate(0, 0); }
`;

const moveBox3 = keyframes`
  9.09% { transform: translate(-26px, 0); }
  18.18% { transform: translate(-26px, 0); }
  27.27% { transform: translate(0, 0); }
  36.36% { transform: translate(-26px, 0); }
  45.45% { transform: translate(-26px, 0); }
  54.55% { transform: translate(-26px, 0); }
  63.64% { transform: translate(-26px, 0); }
  72.73% { transform: translate(-26px, 0); }
  81.82% { transform: translate(-26px, -26px); }
  90.91% { transform: translate(0, -26px); }
  100% { transform: translate(0, 0); }
`;

const moveBox4 = keyframes`
  9.09% { transform: translate(-26px, 0); }
  18.18% { transform: translate(-26px, 0); }
  27.27% { transform: translate(-26px, -26px); }
  36.36% { transform: translate(0, -26px); }
  45.45% { transform: translate(0, 0); }
  54.55% { transform: translate(0, -26px); }
  63.64% { transform: translate(0, -26px); }
  72.73% { transform: translate(0, -26px); }
  81.82% { transform: translate(-26px, -26px); }
  90.91% { transform: translate(-26px, 0); }
  100% { transform: translate(0, 0); }
`;

const moveBox5 = keyframes`
  9.09% { transform: translate(0, 0); }
  18.18% { transform: translate(0, 0); }
  27.27% { transform: translate(0, 0); }
  36.36% { transform: translate(26px, 0); }
  45.45% { transform: translate(26px, 0); }
  54.55% { transform: translate(26px, 0); }
  63.64% { transform: translate(26px, 0); }
  72.73% { transform: translate(26px, 0); }
  81.82% { transform: translate(26px, -26px); }
  90.91% { transform: translate(0, -26px); }
  100% { transform: translate(0, 0); }
`;

const moveBox6 = keyframes`
  9.09% { transform: translate(0, 0); }
  18.18% { transform: translate(-26px, 0); }
  27.27% { transform: translate(-26px, 0); }
  36.36% { transform: translate(0, 0); }
  45.45% { transform: translate(0, 0); }
  54.55% { transform: translate(0, 0); }
  63.64% { transform: translate(0, 0); }
  72.73% { transform: translate(0, 26px); }
  81.82% { transform: translate(-26px, 26px); }
  90.91% { transform: translate(-26px, 0); }
  100% { transform: translate(0, 0); }
`;

const moveBox7 = keyframes`
  9.09% { transform: translate(26px, 0); }
  18.18% { transform: translate(26px, 0); }
  27.27% { transform: translate(26px, 0); }
  36.36% { transform: translate(0, 0); }
  45.45% { transform: translate(0, -26px); }
  54.55% { transform: translate(26px, -26px); }
  63.64% { transform: translate(0, -26px); }
  72.73% { transform: translate(0, -26px); }
  81.82% { transform: translate(0, 0); }
  90.91% { transform: translate(26px, 0); }
  100% { transform: translate(0, 0); }
`;

const moveBox8 = keyframes`
  9.09% { transform: translate(0, 0); }
  18.18% { transform: translate(-26px, 0); }
  27.27% { transform: translate(-26px, -26px); }
  36.36% { transform: translate(0, -26px); }
  45.45% { transform: translate(0, -26px); }
  54.55% { transform: translate(0, -26px); }
  63.64% { transform: translate(0, -26px); }
  72.73% { transform: translate(0, -26px); }
  81.82% { transform: translate(26px, -26px); }
  90.91% { transform: translate(26px, 0); }
  100% { transform: translate(0, 0); }
`;

const moveBox9 = keyframes`
  9.09% { transform: translate(-26px, 0); }
  18.18% { transform: translate(-26px, 0); }
  27.27% { transform: translate(0, 0); }
  36.36% { transform: translate(-26px, 0); }
  45.45% { transform: translate(0, 0); }
  54.55% { transform: translate(0, 0); }
  63.64% { transform: translate(-26px, 0); }
  72.73% { transform: translate(-26px, 0); }
  81.82% { transform: translate(-52px, 0); }
  90.91% { transform: translate(-26px, 0); }
  100% { transform: translate(0, 0); }
`;

// Array con las animaciones en el orden de aparición (para los 9 elementos)
const animations = [
  moveBox1,
  moveBox2,
  moveBox3,
  moveBox4,
  moveBox5,
  moveBox6,
  moveBox7,
  moveBox8,
  moveBox9,
];

const BanterLoader: React.FC = () => {
  return (
    <Box
      sx={{
        width: '72px',
        height: '72px',
        marginLeft: '-36px',
        marginTop: '-36px',
      }}
    >
      {Array.from({ length: 9 }).map((_, index) => {
        // Seleccionamos la animación según el índice (nth-child)
        const animation = animations[index];

        // Estilos base para cada caja
        const boxSx: any = {
          display: 'inline-block',
          position: 'relative',
          width: '20px',
          height: '20px',
          marginRight: '6px',
          animation: `${animation} 4s infinite`,
          '&:before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            background: primary[700],
          },
        };

        // Simula .banter-loader__box:nth-child(3n)
        if ((index + 1) % 3 === 0) {
          boxSx.marginRight = 0;
          boxSx.marginBottom = '6px';
        }
        // Último elemento sin margen inferior extra
        if (index === 8) {
          boxSx.marginBottom = 0;
        }
        // Para nth-child(1) y nth-child(4): se añade margen a la pseudo-elemento
        if (index === 0 || index === 3) {
          boxSx['&:before'] = {
            ...boxSx['&:before'],
            marginLeft: '26px',
          };
        }
        // Para nth-child(3): se añade margen superior a la pseudo-elemento
        if (index === 2) {
          boxSx['&:before'] = {
            ...boxSx['&:before'],
            marginTop: '52px',
          };
        }

        return <Box key={index} sx={boxSx} />;
      })}
    </Box>
  );
};

export default BanterLoader;