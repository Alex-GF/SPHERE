import React, { useState } from 'react';
import { Box, Button, InputBase } from '@mui/material';
import { grey, primary } from '../../../core/theme/palette';
import MagnifyingGlassIcon from '../magnifying-glass';

export default function SearchBar({
  setTextFilterValue,
}: {
  setTextFilterValue: Function;
}) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    setTextFilterValue(searchValue);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        width: '95dvw',
        maxWidth: '500px',
        height: '60px',
        backgroundColor: grey[200],
        borderRadius: '50px',
        position: 'relative',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.5)',
      }}
    >
      <InputBase
        placeholder="Filter by name"
        type="text"
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        onKeyUp={handleKeyPress}
        sx={{
          flex: 1,
          padding: '12px 46px 12px 16px',
          color: '#333',
          fontSize: '20px',
          borderRadius: '50px',
          '& input::placeholder': {
            color: '#000000',
            fontSize: '20px',
          },
        }}
      />
      <Button
        onClick={handleSearch}
        sx={{
          position: 'absolute',
          right: '8px',
          width: '40px',
          height: '40px',
          minWidth: '40px',
          borderRadius: '50%',
          background: primary[500],
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 300ms cubic-bezier(.23, 1, 0.32, 1)',
          '&:hover': {
            backgroundColor: primary[700],
            boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.5)',
            transform: 'translateY(-3px)',
          },
          '&:active': {
            boxShadow: 'none',
            transform: 'translateY(0)',
          },
        }}
      >
        <MagnifyingGlassIcon />
      </Button>
    </Box>
  );
}
