interface DropDownProps {
  desc?: string;
  name: string;
  content: string[];
  className?: string;
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function DropDown({ desc = "", name, content, className, value, onChange, disabled = false }: DropDownProps) {
  const label = (
    <label htmlFor={name} className="block text-sm text-gray-700 mb-1">
      {desc}
    </label>
  );

  return (
    <div className={className}>
      {desc && label}

      <select
        id={name}
        name={name}
        autoComplete={name + "-name"}
        disabled={disabled}
        className="truncate pr-6 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        value={value}
        data-testid="selector"
        onChange={e => {
          onChange(parseInt(e.target.value, 10));
        }}
      >
        {content.map((item, index) => (
          <option key={index} value={index}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
