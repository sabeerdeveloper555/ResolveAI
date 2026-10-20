interface AvatarProps {
  initials: string;
  color: string;
  // Adds the white ring used when avatars overlap in a stack.
  stacked?: boolean;
  label?: string;
}

export function Avatar({
  initials,
  color,
  stacked = false,
  label,
}: AvatarProps) {
  return (
    <div
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${color} ${
        stacked ? 'border-2 border-white' : ''
      }`}
    >
      {initials}
    </div>
  );
}
