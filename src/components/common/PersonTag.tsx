interface PersonTagProps {
  highlighted?: boolean;
  name: string;
}

export function PersonTag({ highlighted, name }: PersonTagProps) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        highlighted
          ? 'bg-gold text-gray-900'
          : 'bg-gray-700 text-gray-300'
      }`}
    >
      {name}
    </span>
  );
}
