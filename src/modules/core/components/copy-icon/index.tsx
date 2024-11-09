import { Box, Button, InputBase, SvgIcon } from '@mui/material';
import { grey, primary, success } from '../../theme/palette';
import { useState } from 'react';

export default function CopyToClipboardIcon({ value }: { value: string }) {
  
  const [linkCopied, setLinkCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      console.log(value);
      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    });
  };

  return (
    <Box
      display="flex"
      border={1}
      borderRadius="5px 5px 5px 5px"
      borderColor={linkCopied ? success.light : primary[800]}
      width="100%"
      overflow="hidden"
    >
      <InputBase
        value={value}
        readOnly
        sx={{
          py: 0,
          pl: 2,
          pr: 0,
          borderRadius: '4px 0 0 4px',
          flexGrow: '1'
        }}
      />
      <Button
        onClick={handleCopy}
        sx={{
          py: 1,
          width: '40px',
          height: '40px',
          minWidth: 0,
          backgroundColor: linkCopied ? success.light : primary[800],
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0 4px 4px 0',
          '&:hover': {
            backgroundColor: 'green.400',
          },
        }}
      >
        <SvgIcon viewBox="0 0 24 24" fontSize="small">
          <rect fill="none"></rect>
          <rect
            x="4"
            y="8"
            width="12"
            height="12"
            rx="1"
            fill="none"
            stroke={grey[100]}
            strokeLinecap="round"
            strokeLinejoin="round"
          ></rect>
          <path
            d="M8 6V5C8 4.44772 8.44772 4 9 4H19C19.5523 4 20 4.44772 20 5V15C20 15.5523 19.5523 16 19 16H18"
            fill="none"
            stroke={grey[100]}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2 2"
          ></path>
        </SvgIcon>
      </Button>
    </Box>
  );
}
