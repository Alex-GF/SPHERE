import Grid from "@mui/material/Grid2";

export default function EditorPage() {
  return (
    <Grid container spacing={2} sx={{
      width: '100%',
      height: '100%'
    }}>
      <Grid size={6}>
        Test left
      </Grid>
      <Grid size={6}>
        Test right
      </Grid>
    </Grid>
  );
}
