import { Configuration } from '../configuration-space-view';
import { Masonry } from '@mui/lab';
import ConfigurationSpaceItem from '../configuration-space-item';
import ConfigurationDetailsModal from '../configuration-details-modal';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function ConfigurationSpaceGrid({
  configurationSpace,
}: Readonly<{
  configurationSpace: Configuration[];
}>) {

  const [open, setOpen] = useState<boolean>(true);
  const [selectedConfiguration, setSelectedConfiguration] = useState<Configuration | undefined>(undefined);

  function handleCardClick(configuration: Configuration) {
    setSelectedConfiguration(configuration);
    setOpen(true);
  }

  function handleClose(){
    setOpen(false);
    setSelectedConfiguration(undefined);
  }

  return (
    <>
      <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
        {configurationSpace.map((configuration) => (
          <ConfigurationSpaceItem key={uuidv4()} configuration={configuration} onClick={handleCardClick} />
        ))}
      </Masonry>
      <ConfigurationDetailsModal configuration={selectedConfiguration} isOpen={open} handleClose={handleClose}/>
    </>
  );
}
