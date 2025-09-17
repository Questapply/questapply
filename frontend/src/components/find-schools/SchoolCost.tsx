import { motion } from "framer-motion";

interface SchoolCostProps {
  inState: number | null; // اکنون می تواند null باشد
  outState: number | null; // اکنون می تواند null باشد
}

const SchoolCost = ({ inState, outState }: SchoolCostProps) => {
  const formatCurrency = (value: number | null) => {
    // ورودی می تواند null باشد
    if (value === null || isNaN(value)) {
      // اگر null یا NaN بود
      return "N/A"; // یا هر رشته دیگری که می‌خواهید نمایش دهید
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800/60 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Tuition Cost
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            In-state
          </div>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-semibold text-gray-800 dark:text-white"
          >
            {formatCurrency(inState)} {/* اینجا از inState استفاده می‌شود */}
          </motion.div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Out-of-state
          </div>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-lg font-semibold text-gray-800 dark:text-white"
          >
            {formatCurrency(outState)} {/* اینجا از outState استفاده می‌شود */}
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
