import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_GRADIENTS = [
  'from-soft-blue to-lavender',
  'from-mint to-soft-blue',
  'from-lavender to-pale-pink',
  'from-pale-pink to-soft-blue',
  'from-mint to-lavender',
  'from-soft-blue/80 to-mint/80',
  'from-lavender/80 to-soft-blue/80',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

interface ClientAvatarProps {
  name: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-11 w-11 text-sm',
};

export function ClientAvatar({ name, logoUrl, size = 'md', className }: ClientAvatarProps) {
  return (
    <Avatar className={cn(SIZES[size], 'ring-2 ring-border/50 shadow-sm', className)}>
      {logoUrl && <AvatarImage src={logoUrl} alt={name} className="object-cover" />}
      <AvatarFallback className={cn('bg-gradient-to-br text-white font-semibold', `${getAvatarColor(name)}`)}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
