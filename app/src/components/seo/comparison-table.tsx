import React from "react";

type Column = {
  header: string;
  accessor: string;
};

type ComparisonTableProps = {
  title: string;
  description?: string;
  columns: Column[];
  data: Record<string, any>[];
};

export const ComparisonTable = ({ title, description, columns, data }: ComparisonTableProps) => {
  return (
    <div className="my-10">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        {description && <p className="text-gray-400 mt-1">{description}</p>}
      </div>
      
      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900 shadow-xl">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-950/50 text-xs uppercase text-gray-400 border-b border-gray-800">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} scope="col" className="px-6 py-4 font-semibold tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-800/50 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-6 py-4 whitespace-nowrap ${colIdx === 0 ? "font-bold text-white" : ""}`}>
                    {row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
