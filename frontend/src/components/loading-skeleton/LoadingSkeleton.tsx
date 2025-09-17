import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  type?: 'spinner' | 'skeleton' | 'both'; // نوع لودینگ
  count?: number; // تعداد اسکلتون‌ها (برای لیست‌ها)
}

const LoadingSkeleton = ({ type = 'both', count = 3 }: LoadingSkeletonProps) => {
  // انیمیشن پالس برای اسکلتون
  const pulseVariants = {
    initial: { opacity: 0.4 },
    animate: { 
      opacity: 0.8, 
      transition: { 
        duration: 0.8, 
        repeat: Infinity, 
        repeatType: 'reverse' as 'reverse' // Ensure this is a valid type
      } 
    },
  };

  // اسپینر
  const spinner = (
    <motion.div
      className="flex justify-center items-center h-32"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <div className="w-12 h-12 border-4 border-t-purple-500 border-gray-200 dark:border-gray-700 rounded-full" />
    </motion.div>
  );

  // اسکلتون کارت
  const skeletonCard = (
    <motion.div
      className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 shadow-md p-6"
      variants={pulseVariants}
      initial="initial"
      animate="animate"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* بخش اطلاعات پایه و رتبه‌بندی */}
        <div className="flex flex-col gap-6 w-full md:w-1/3">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </div>
        </div>
        {/* بخش محتوای اصلی */}
        <div className="flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="lg:col-span-2 h-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {type === 'spinner' || type === 'both' ? spinner : null}
      {type === 'skeleton' || type === 'both' ? (
        Array.from({ length: count }).map((_, index) => (
          <div key={index}>{skeletonCard}</div>
        ))
      ) : null}
    </div>
  );
};

export default LoadingSkeleton;