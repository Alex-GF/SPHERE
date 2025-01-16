import { Code, OpenInFull, Send } from "@mui/icons-material";
import { Button, IconButton, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";


export default function Harvey() {

    const [message, setMessage] = useState('')

    return (
        <>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" gutterBottom>
                  HARVEY
                  </Typography>
                  <IconButton title="Expand chat">
                      <OpenInFull />
                  </IconButton>
              </Box>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Input a message to start chatting with HARVEY..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  multiline
                  rows={4}
                />
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Button startIcon={<Code />}>View Code</Button>
                  <Button
                    variant="contained"
                    endIcon={<Send />}
                    onClick={() => setMessage('')}
                  >
                    Send
                  </Button>
                </Box>
              </Box>
            </>
    );
}