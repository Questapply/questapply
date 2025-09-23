import { motion } from "framer-motion";

interface SchoolCostProps {
  inState: number | null;
  outState: number | null;
}

const SchoolCost = ({ inState, outState }: SchoolCostProps) => {
  const formatCurrency = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="rounded-lg bg-gray-100/70 dark:bg-gray-800/60 p-3 md:p-4 min-w-0">
      <h4 className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 md:mb-3">
        Tuition Cost
      </h4>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="min-w-0">
          <div className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
            In-state
          </div>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-base md:text-lg font-semibold text-gray-800 dark:text-white"
          >
            {formatCurrency(inState)}
          </motion.div>
        </div>

        <div className="min-w-0">
          <div className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400">
            Out-of-state
          </div>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="text-base md:text-lg font-semibold text-gray-800 dark:text-white"
          >
            {formatCurrency(outState)}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SchoolCost;

// interface SchoolCostProps {
//   inState: number;
//   outState: number;
// }

// const SchoolCost = ({ inState, outState }: SchoolCostProps) => {
//   const formatCurrency = (value: number) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       maximumFractionDigits: 0
//     }).format(value);
//   };

//   return (
//     <div className="bg-gray-100 dark:bg-gray-800/60 p-4 rounded-lg">
//       <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tuition Cost</h4>
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <div className="text-xs text-gray-500 dark:text-gray-400">In-state</div>
//           <motion.div
//             initial={{ opacity: 0, y: 5 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//             className="text-lg font-semibold text-gray-800 dark:text-white"
//           >
//             {formatCurrency(inState)}
//           </motion.div>
//         </div>
//         <div>
//           <div className="text-xs text-gray-500 dark:text-gray-400">Out-of-state</div>
//           <motion.div
//             initial={{ opacity: 0, y: 5 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3, delay: 0.1 }}
//             className="text-lg font-semibold text-gray-800 dark:text-white"
//           >
//             {formatCurrency(outState)}
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SchoolCost;
