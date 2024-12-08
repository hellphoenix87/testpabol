interface SelectMenuProps {
  label?: string;
  valuesList: any[];
  displayedOptionsLsit?: string[];
  value: string | undefined;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export default function SelectMenu(props: SelectMenuProps) {
  const { label = null, valuesList, displayedOptionsLsit, value, onChange, className } = props;

  return (
    <div className={className}>
      {label && (
        <label htmlFor="select" className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        name="location"
        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
      >
        {valuesList.map((option, index) => (
          <option value={option} key={index}>
            {displayedOptionsLsit?.[index] || option}
          </option>
        ))}
      </select>
    </div>
  );
}
