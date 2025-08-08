import { ArrowUpDown } from 'lucide-react';

export default function Table({ columns = [], data = [], actions }) {
  // Make sure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                <div className="group inline-flex">
                  {column.label}
                  <span className="ml-2 flex-none rounded text-gray-400">
                    <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </th>
            ))}
            {actions && (
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6" />
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {safeData.length > 0 ? (
            safeData.map((item) => (
              <tr key={item.id || Math.random()}>
                {columns.map((column) => (
                  <td
                    key={`${item.id || Math.random()}-${column.key}`}
                    className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                  >
                    {typeof column.render === 'function'
                      ? column.render(item[column.key], item)
                      : item[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    {typeof actions === 'function' ? actions(item) : actions}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-3 py-4 text-sm text-gray-500 text-center"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
