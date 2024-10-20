import Grid from "@mui/material/Grid2";
import Editor from "@monaco-editor/react";

export default function EditorPage() {
  function handleEditorChange(value: string | undefined) {
    if (value) {
    }
  }

  return (
    <Grid
      container
      spacing={2}
      sx={{
        width: "100%",
        height: "100%",
      }}
    >
      <Grid size={6}>
        <Editor
          height="100%"
          defaultLanguage="yaml"
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: {
              enabled: false
            }
          }}
        />
      </Grid>
      <Grid size={6}>Test right</Grid>
    </Grid>
  );
}
