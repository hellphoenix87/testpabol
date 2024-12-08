interface TableProps {
  headList: string[];
  bodyList: Array<{ [key: string]: string | number | JSX.Element }>;
}

// headList is an array of strings that represent the table headers in order
// bodyList is an array of objects that represent the table body, each object has the same keys as the headList
// the values of bodyList objects can be strings, numbers or JSX elements
export function Table({ headList = [], bodyList }: TableProps) {
  return (
    <div className="relative overflow-x-auto w-full">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            {headList.map((head, index) => (
              <th key={index} scope="col" className="px-6 py-3">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyList.map((element, index) => (
            <tr key={index} className="bg-white border-b">
              {headList.map((head, index) => (
                <td key={index} className="px-6 py-4">
                  {element[head]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
