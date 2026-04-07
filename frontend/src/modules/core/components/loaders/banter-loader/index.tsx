import React from 'react';

const BanterLoader: React.FC = () => {
  return (
    <div className="-ml-9 -mt-9 grid h-[72px] w-[72px] grid-cols-3 gap-[6px]">
      {Array.from({ length: 9 }).map((_, index) => {
        return (
          <div
            key={index}
            className="banter-box h-[20px] w-[20px] animate-banter-box bg-sphere-primary-700"
          />
        );
      })}
    </div>
  );
};

export default BanterLoader;