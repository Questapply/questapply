// import { useState } from "react";
// import { Filter } from "lucide-react";
// import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";

// type ApplicationFilter = {
//   id: string;
//   name: string;
// };

// interface ApplicationFiltersProps {
//   activeFilters: string[];
//   toggleFilter: (filterId: string) => void;
// }

// const filters: ApplicationFilter[] = [
//   { id: "deadline", name: "Deadline" },
//   { id: "qsRank", name: "QS Rank" },
//   { id: "gpa", name: "GPA" },
//   { id: "applicationFee", name: "Application Fee" },
//   { id: "desc", name: "DESC" },
//   { id: "asc", name: "ASC" }
// ];

// const ApplicationFilters = ({ activeFilters, toggleFilter }: ApplicationFiltersProps) => {
//   return (
//     <motion.div
//       className="flex flex-wrap gap-4 items-center mb-8"
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay: 0.2 }}
//     >
//       <div className="flex items-center">
//         <div className="flex items-center mr-2">
//           <Filter className="h-5 w-5 text-gray-500 mr-1" />
//           <span className="text-gray-700 dark:text-gray-300 font-medium">Order by:</span>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           {filters.map((filter, index) => (
//             <motion.button
//               key={filter.id}
//               className={`
//                 px-4 py-1.5 rounded-full text-sm
//                 ${
//                   activeFilters.includes(filter.id)
//                     ? "bg-purple-600 text-white"
//                     : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
//                 }
//                 transition-colors duration-200
//               `}
//               onClick={() => toggleFilter(filter.id)}
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               {filter.name}
//             </motion.button>
//           ))}
//         </div>
//       </div>
//       <motion.div
//         className="ml-auto"
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.3, delay: 0.4 }}
//       >
//         <Button className="bg-purple-600 hover:bg-purple-700">
//           <Filter className="mr-2 h-4 w-4" />
//           Filter My Applications
//         </Button>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default ApplicationFilters;

/////////////////////////////////
////////////////////////////////////
////////////////////////////////////////
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Filter } from "lucide-react";

type SortKey = "deadline" | "qs_rank" | "MIN_GPA" | "extra_appication_fee";
type SortOrder = "asc" | "desc";

interface Props {
  sortKey: SortKey;
  sortOrder: SortOrder;
  onApply: (payload: { sortKey: SortKey; sortOrder: SortOrder }) => void;
}

const ApplicationFilters: React.FC<Props> = ({
  sortKey,
  sortOrder,
  onApply,
}) => {
  const [localSortKey, setLocalSortKey] = useState<SortKey>(sortKey);
  const [localSortOrder, setLocalSortOrder] = useState<SortOrder>(sortOrder);

  useEffect(() => {
    setLocalSortKey(sortKey);
    setLocalSortOrder(sortOrder);
  }, [sortKey, sortOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({ sortKey: localSortKey, sortOrder: localSortOrder });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mb-4">
      <div className="flex flex-wrap items-end gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
        {/* Order by */}
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-500 mr-1" />
          <span className="font-semibold">Order by:</span>
          {(
            [
              "deadline",
              "qs_rank",
              "MIN_GPA",
              "extra_appication_fee",
            ] as SortKey[]
          ).map((key) => (
            <label key={key} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="orderby"
                value={key}
                checked={localSortKey === key}
                onChange={() => setLocalSortKey(key)}
              />
              <span className="text-sm">
                {key === "qs_rank"
                  ? "QS Rank"
                  : key === "MIN_GPA"
                  ? "GPA"
                  : key === "extra_appication_fee"
                  ? "Application Fee"
                  : "Deadline"}
              </span>
            </label>
          ))}
        </div>

        {/* Order */}
        <div className="flex items-center gap-3">
          <span className="font-semibold">Order:</span>
          {(["asc", "desc"] as SortOrder[]).map((ord) => (
            <label key={ord} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="order"
                value={ord}
                checked={localSortOrder === ord}
                onChange={() => setLocalSortOrder(ord)}
              />
              <span className="text-sm uppercase">{ord}</span>
            </label>
          ))}
        </div>

        <Button type="submit" className="ml-auto flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter My Applications
        </Button>
      </div>
    </form>
  );
};

export default ApplicationFilters;
