import { Tag } from "./Tag";

interface TagsProps {
  tags: string[];
  genre: string;
}

export function Tags({ tags, genre }: TagsProps) {
  // Show all badges in a single row. If horizontal space is too small, hide the overflow, without a scrollbar.
  return (
    <div className="flex flex-row items-center overflow-x-hidden pb-4 gap-4">
      <b className="text-gray-500 text-xs">{genre}</b>
      {tags.map((tag, index) => (
        <Tag key={index} text={tag} />
      ))}
    </div>
  );
}
