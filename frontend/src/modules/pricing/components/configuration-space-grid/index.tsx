import { Configuration } from "../configuration-space-view";
import { Masonry } from '@mui/lab';
import ConfigurationSpaceItem from "../configuration-space-item";

export default function ConfigurationSpaceGrid({configurationSpace}: {configurationSpace: Configuration[]}) {
  return(
    <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
        {configurationSpace.map((configuration, i) => (
          <ConfigurationSpaceItem
            key={i}
            configuration={configuration}
          />
        ))}
      </Masonry>
  )
}