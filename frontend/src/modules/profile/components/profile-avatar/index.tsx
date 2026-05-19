import Avatar from '../../../core/components/avatar';

interface ProfileAvatarProps {
  sizeClass?: string;
}

export default function ProfileAvatar({ sizeClass = 'w-40 h-40' }: ProfileAvatarProps) {
  // Parse size from class (e.g., "w-40 h-40" → 160)
  const match = sizeClass.match(/w-(\d+)/);
  const size = match ? parseInt(match[1]) * 4 : 160;

  return (
    <div className={`overflow-hidden rounded-full ${sizeClass}`}>
      <Avatar w={size} h={size} />
    </div>
  );
}
