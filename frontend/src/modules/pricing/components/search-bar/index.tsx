import React, { useState } from 'react';
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
    <div className="relative mx-auto flex h-[60px] w-[95dvw] max-w-[500px] items-center justify-between gap-2 rounded-[50px] bg-slate-100 shadow-[0px_4px_6px_rgba(0,0,0,0.5)]">
      <input
        placeholder="Filter by name"
        type="text"
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        onKeyUp={handleKeyPress}
        className="flex-1 rounded-[50px] bg-transparent px-4 py-3 pr-12 text-[20px] text-[#333] placeholder:text-[20px] placeholder:text-black focus:outline-none"
      />
      <button
        type="button"
        onClick={handleSearch}
        className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-sphere-primary-500 text-white transition-all duration-300 [transition-timing-function:cubic-bezier(.23,1,0.32,1)] hover:-translate-y-[3px] hover:bg-sphere-primary-700 hover:shadow-[0px_10px_20px_rgba(0,0,0,0.5)] active:translate-y-0 active:shadow-none"
      >
        <MagnifyingGlassIcon />
      </button>
    </div>
  );
}
