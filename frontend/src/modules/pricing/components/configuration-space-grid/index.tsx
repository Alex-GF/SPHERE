import { Configuration } from '../configuration-space-view';
import ConfigurationSpaceItem from '../configuration-space-item';
import ConfigurationDetailsModal from '../configuration-details-modal';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function ConfigurationSpaceGrid({
  configurationSpace,
}: Readonly<{
  configurationSpace: Configuration[];
}>) {

  const [open, setOpen] = useState<boolean>(false);
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {configurationSpace.map((configuration) => (
          <ConfigurationSpaceItem key={uuidv4()} configuration={configuration} onClick={handleCardClick} />
        ))}
      </div>
      <ConfigurationDetailsModal configuration={selectedConfiguration} isOpen={open} handleClose={handleClose}/>
    </>
  );
}
