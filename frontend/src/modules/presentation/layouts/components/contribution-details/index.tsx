import { Contribution } from '../../../pages/contributions/data/contributions-data';
import { Box, Modal, Typography, Fade, Divider } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ContributionDetailsModal({
  selectedContribution,
  isOpen,
  handleClose,
}: {
  selectedContribution: Contribution | null;
  isOpen: boolean;
  handleClose: () => void;
}) {
  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      closeAfterTransition
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={isOpen}>
        <Box
          sx={{
            position: 'absolute' as 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 1200,
            height: '90dvh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {selectedContribution && (
            <>
              {/* Title */}
              <Typography variant="h3" sx={{ mb: 10, fontWeight: 'bold', textAlign: 'center' }}>
                {selectedContribution.title}
              </Typography>

              {/* Content section with two columns */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                {/* Description Column */}
                <Box
                  sx={{
                    flex: 7,
                    overflowY: 'auto',
                    pr: { md: 2 },
                    textAlign: 'justify',
                  }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer">
                          {props.children}
                        </a>
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 style={{ fontWeight: 'bold', marginTop: '1.5em' }} {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul style={{ paddingLeft: '1.5em', listStyleType: 'disc' }} {...props}>
                          {props.children}
                        </ul>
                      ),
                      li: ({ node, ...props }) => (
                        <li style={{ marginBottom: '0.5em' }} {...props} />
                      ),
                    }}
                  >
                    {selectedContribution.markdownDescription}
                  </ReactMarkdown>
                </Box>

                {/* Divider */}
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    display: { xs: 'none', md: 'block' },
                    width: '2px',
                    backgroundColor: 'grey.300',
                    mx: 2,
                  }}
                />

                {/* Supervisor and Tags Column */}
                <Box
                  sx={{
                    flex: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    overflowY: 'auto',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Supervisor/s:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedContribution.supervisor}
                  </Typography>

                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                    Tags:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedContribution.tags.map(tag => tag)}
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Fade>
    </Modal>
  );
}
