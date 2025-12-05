import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Typography, Paper, Button, Accordion, AccordionSummary, AccordionDetails, CircularProgress } from '@mui/material';
import { grey, primary } from '../../core/theme/palette';

import type { ChatMessage, PromptPreset } from '../types/types';

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  promptPresets?: PromptPreset[];
  onPresetSelect?: (preset: PromptPreset) => void;
}

function ChatTranscript({ messages, isLoading, promptPresets = [], onPresetSelect }: Props) {
  return (
    <Box sx={{ height: '100%', overflowY: 'auto', p: 2 }} aria-live="polite" aria-busy={isLoading}>
      {messages.length === 0 && !isLoading ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h1" sx={{ fontSize: '3rem', mb: 2 }}>💬</Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, color: grey[800] }}>
              Welcome to H.A.R.V.E.Y.
            </Typography>
            <Typography variant="body1" sx={{ color: grey[600] }}>
              Your AI assistant for pricing intelligence and optimal subscription recommendations.
            </Typography>
          </Box>
          {promptPresets.length > 0 && onPresetSelect && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '600px', mx: 'auto' }}>
              {promptPresets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outlined"
                  onClick={() => onPresetSelect(preset)}
                  sx={{
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    p: 2,
                    textTransform: 'none',
                    borderColor: grey[300],
                    '&:hover': {
                      borderColor: primary[500],
                      backgroundColor: primary[100]
                    }
                  }}
                >
                  <Typography>{preset.label}</Typography>
                </Button>
              ))}
            </Box>
          )}
        </Box>
      ) : null}
      {messages.map((message) => (
        <Paper
          key={message.id}
          sx={{
            mb: 2,
            p: 2,
            backgroundColor: message.role === 'user' ? primary[100] : grey[100],
            borderLeft: `4px solid ${message.role === 'user' ? primary[500] : grey[500]}`
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: grey[800] }}>
              {message.role === 'user' ? 'You' : 'H.A.R.V.E.Y.'}
            </Typography>
            <Typography variant="caption" sx={{ color: grey[600] }}>
              {new Date(message.createdAt).toLocaleTimeString()}
            </Typography>
          </Box>
          <Box sx={{ '& p': { mb: 1 }, '& pre': { backgroundColor: grey[200], p: 1, borderRadius: 1, overflowX: 'auto' } }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </Box>
          {message.metadata?.plan || message.metadata?.result ? (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary>
                <Typography variant="body2">View H.A.R.V.E.Y. context</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {message.metadata.plan ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Planner</Typography>
                    <Box component="pre" sx={{ backgroundColor: grey[200], p: 1, borderRadius: 1, overflowX: 'auto', fontSize: '0.875rem' }}>
                      {JSON.stringify(message.metadata.plan, null, 2)}
                    </Box>
                  </Box>
                ) : null}
                {message.metadata.result ? (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Result</Typography>
                    <Box component="pre" sx={{ backgroundColor: grey[200], p: 1, borderRadius: 1, overflowX: 'auto', fontSize: '0.875rem' }}>
                      {JSON.stringify(message.metadata.result, null, 2)}
                    </Box>
                  </Box>
                ) : null}
              </AccordionDetails>
            </Accordion>
          ) : null}
        </Paper>
      ))}
      {isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
          <CircularProgress size={24} />
          <Typography>Processing request...</Typography>
        </Box>
      ) : null}
    </Box>
  );
}

export default ChatTranscript;
