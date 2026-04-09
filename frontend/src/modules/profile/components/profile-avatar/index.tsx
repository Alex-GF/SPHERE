import { useAuth } from '../../../auth/hooks/useAuth';

interface ProfileAvatarProps {
  sizeClass?: string;
}

export default function ProfileAvatar({ sizeClass = 'w-40 h-40' }: ProfileAvatarProps) {
  
  const {authUser} = useAuth();
  
  return (
    <div className={`overflow-hidden rounded-full ${sizeClass}`}>
      <img
        src={authUser.user?.avatar}
        alt="Avatar"
        className="h-full w-full rounded-full"
      />
    </div>
  );
}
