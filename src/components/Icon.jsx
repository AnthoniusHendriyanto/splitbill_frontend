import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Icon({ name, className }) {
  return (
    <span className={cn("material-symbols-outlined", className)}>{name}</span>
  );
}
