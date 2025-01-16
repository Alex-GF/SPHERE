import { Modal, Paper } from "@mui/material";
import { flex } from "../../theme/css";
import FileUpload from "../file-upload-input";

export default function ImportPricingModal({modalState, handleClose, onSubmit}: {modalState: boolean, handleClose: () => void, onSubmit: (file: File) => void}) {
    return(
        <Modal
        open={modalState}
        onClose={handleClose}
        aria-labelledby="modal-import-title"
        aria-describedby="modal-import-description"
      >
        <Paper
          elevation={3}
          sx={{
            maxWidth: 500,
            width: '90dvw',
            mx: 'auto',
            mt: 4,
            p: 4,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
            borderRadius: '20px',
            ...flex({ direction: 'column' }),
          }}
        >
          <FileUpload onSubmit={onSubmit}/>
        </Paper>
      </Modal>
    );
}