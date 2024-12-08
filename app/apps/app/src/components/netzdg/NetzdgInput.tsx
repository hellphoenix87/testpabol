interface NetzdgInputProps {
  label: string;
  name: string;
  type: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  comment?: string;
}

export default function NetzdgInput(props: NetzdgInputProps) {
  const { label, name, type, handleChange, comment } = props;

  return (
    <div className="max-w-3xl mt-10">
      <label htmlFor={name} className="block text-sm leading-6">
        {label}
      </label>
      <div className="mt-2">
        <input
          type={type}
          name={name}
          id={name}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          onChange={handleChange}
        />
      </div>
      {comment && (
        <p className="mt-2 text-sm text-gray-500" id="email-description">
          {comment}
        </p>
      )}
    </div>
  );
}
