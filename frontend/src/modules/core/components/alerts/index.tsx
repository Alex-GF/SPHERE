import { useEffect, useState } from "react";
import { CSSTransition, TransitionGroup } from 'react-transition-group';

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
    <div className="fixed bottom-0 right-0 w-dvw max-w-[500px] p-[10px]">
      <TransitionGroup>
        {renderedMessages.map((message, index) => (
          <CSSTransition key={index} timeout={500} classNames="alert">
            <div className="animate-alert-slide-in rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
              {message}
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  );
}
