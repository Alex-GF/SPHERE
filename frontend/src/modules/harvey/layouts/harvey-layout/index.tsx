import HarveyHeader from './harvey-header';

interface Props {
  children?: React.ReactNode;
  isPlayground?: boolean;
  onNewConversation?: () => void;
}

export default function HarveyLayout({ children, isPlayground, onNewConversation }: Props) {
  return (
    <div className="flex h-dvh flex-col bg-tp-canvas">
      <HarveyHeader isPlayground={isPlayground} onNewConversation={onNewConversation} />
      {children}
    </div>
  );
}
