import { ConfigurationSpace } from "../configuration-space-view";
import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { Masonry } from '@mui/lab';

export default function ConfigurationSpaceGrid({configurationSpace}: {configurationSpace: ConfigurationSpace[]}) {
  return(
    <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
        {configurationSpace.map((configuration, i) => (
          <Card key={i} variant="outlined">
            <CardContent>
              <Typography variant="h5" component="div">
                {configuration.selectedPlan}
              </Typography>
              {configuration.selectedAddons.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>
                    Add-ons:
                  </Typography>
                  <List dense>
                    {configuration.selectedAddons.map((addon, j) => (
                      <ListItem key={j} disableGutters>
                        <ListItemText primary={addon} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </Masonry>
  )
}