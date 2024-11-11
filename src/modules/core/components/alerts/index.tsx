import { useEffect, useState } from "react";
import { Alert, Box } from "@mui/material";
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { keyframes } from '@emotion/react';
import { styled } from '@mui/system';

const slideIn = keyframes`
  0% { transform: translateX(100%); }
  60% { transform: translateX(-10%); }
  80% { transform: translateX(10%); }
  100% { transform: translateX(0); }
`;

const VibratingBox = styled(Box)<{ exit?: boolean }>(() => ({
  animation: `${slideIn} 0.5s ease-in-out`,
}));

export default function Alerts({ messages }: { messages: string[] }): JSX.Element {
  const [renderedMessages, setRenderedMessages] = useState<string[]>([]);

  useEffect(() => {
    for(const message of renderedMessages) {
      if (!messages.includes(message)) {
        setRenderedMessages([]);
      }
    }
  
    for(const message of messages){
      if (!renderedMessages.includes(message)) {
        setRenderedMessages((prevMessages) => [...prevMessages, message]);
      }
    }
  }, [messages]);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: "0",
        right: "0",
        padding: "10px",
        width: "100dvw",
        maxWidth: "500px",
      }}
    >
      <TransitionGroup>
        {renderedMessages.map((message, index) => (
          <CSSTransition key={index} timeout={500} classNames="alert">
            <VibratingBox>
              <Alert severity="error">{message}</Alert>
            </VibratingBox>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </Box>
  );
}
