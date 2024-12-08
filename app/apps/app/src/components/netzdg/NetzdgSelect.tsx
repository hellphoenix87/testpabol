interface NetzdgSelectProps {
  label: string;
  name: string;
  handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}

export default function NetzdgSelect(props: NetzdgSelectProps) {
  const { label, name, handleChange, children } = props;

  return (
    <div className="max-w-3xl mt-10">
      <label htmlFor={name} className="block text-sm leading-6">
        {label}
      </label>
      <div className="mt-2">
        <select
          name={name}
          id={name}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          defaultValue=""
          onChange={handleChange}
        >
          <option disabled value="">
            select an option
          </option>
          {children}
        </select>
      </div>
    </div>
  );
}
