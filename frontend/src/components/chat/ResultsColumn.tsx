// import { motion, AnimatePresence } from "framer-motion";
// import { ScrollArea } from "@/components/ui/scroll-area";

// interface ResultsColumnProps {
//   results: any[];
//   resultType: string;
//   renderCard: (item: any, index: number) => React.ReactNode;
//   emptyState?: React.ReactNode;
//   isDarkMode?: boolean;
//   title?: string;
// }

// const ResultsColumn = ({
//   results,
//   resultType,
//   renderCard,
//   emptyState,
//   isDarkMode = false,
//   title,
// }: ResultsColumnProps) => {
//   const defaultEmptyState = (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.9 }}
//       animate={{ opacity: 1, scale: 1 }}
//       className={`text-center py-16 ${
//         isDarkMode ? "text-gray-400" : "text-gray-500"
//       }`}
//     >
//       <div className="mb-6">
//         <div
//           className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
//             isDarkMode ? "bg-gray-700" : "bg-gray-100"
//           }`}
//         >
//           <span className="text-2xl">🔍</span>
//         </div>
//       </div>
//       <h3
//         className={`text-lg font-medium mb-2 ${
//           isDarkMode ? "text-gray-300" : "text-gray-700"
//         }`}
//       >
//         Start Your Search
//       </h3>
//       <p className="text-sm max-w-sm mx-auto">
//         Use the chat on the left to search and discover results. Your findings
//         will appear here.
//       </p>
//     </motion.div>
//   );

//   return (
//     <div className="flex flex-col h-full">
//       {/* Header */}
//       {title && (
//         <div
//           className={`border-b px-6 py-4 ${
//             isDarkMode
//               ? "border-gray-700 bg-gray-800"
//               : "border-gray-200 bg-gray-50"
//           }`}
//         >
//           <div className="flex items-center justify-between">
//             <h2
//               className={`text-lg font-semibold ${
//                 isDarkMode ? "text-gray-100" : "text-gray-900"
//               }`}
//             >
//               {title}
//             </h2>
//             {results.length > 0 && (
//               <span
//                 className={`text-sm px-3 py-1 rounded-full ${
//                   isDarkMode
//                     ? "bg-gray-700 text-gray-300"
//                     : "bg-gray-200 text-gray-600"
//                 }`}
//               >
//                 {results.length} result{results.length !== 1 ? "s" : ""}
//               </span>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Results */}
//       <ScrollArea className="flex-1">
//         <div className="p-6">
//           <AnimatePresence mode="wait">
//             {results.length === 0 ? (
//               <div key="empty">{emptyState || defaultEmptyState}</div>
//             ) : (
//               <motion.div
//                 key="results"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="space-y-6"
//               >
//                 {results.map((item, index) => (
//                   <motion.div
//                     key={item.id || index}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{
//                       duration: 0.4,
//                       delay: index * 0.1,
//                     }}
//                   >
//                     {renderCard(item, index)}
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </ScrollArea>
//     </div>
//   );
// };

// export default ResultsColumn;

/////////////////////////
//////////////////////////////////
// src/app/chat/ResultsColumn.tsx
import React from "react";

type ResultsColumnProps = {
  children?: React.ReactNode;
  title?: string;
  padded?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  toolbar?: React.ReactNode;
};

export default function ResultsColumn({
  children,
  title,
  padded = true,
  emptyState,
  className = "",
  toolbar,
}: ResultsColumnProps) {
  // تعداد واقعی نودها (حتی اگر Fragment/شرطی باشند)
  const count = React.Children.count(children);

  // بعضی وقت‌ها children می‌تونه false/null باشه؛ اینو هم هندل می‌کنیم
  let hasRenderableChild = false;
  React.Children.forEach(children, (child) => {
    if (child !== null && child !== undefined && child !== false) {
      hasRenderableChild = true;
    }
  });

  const hasContent = count > 0 && hasRenderableChild;

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {title || toolbar ? (
        <div className="border-b px-4 py-3 rounded-t-lg border-border bg-muted/30 flex items-center justify-between sticky top-0 z-10">
          <h3 className="font-semibold">{title}</h3>
          <div>{toolbar}</div>
        </div>
      ) : null}

      <div className={`flex-1 overflow-auto ${padded ? "p-4" : ""}`}>
        {hasContent ? (
          children
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
            {emptyState ?? "No results to display"}
          </div>
        )}
      </div>
    </div>
  );
}
