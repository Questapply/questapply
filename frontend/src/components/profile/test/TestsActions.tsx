import React from "react";
import { motion } from "framer-motion";
import { Button } from "../../ui/button";
import { ArrowRight } from "lucide-react";

interface TestsActionsProps {
  onPrevious: () => void;
  onNext: () => void;
  variants: any;
}

const TestsActions: React.FC<TestsActionsProps> = ({
  onPrevious,
  onNext,
  variants,
}) => {
  return (
    <motion.div variants={variants} className="flex justify-between pt-6">
      <Button variant="outline" onClick={onPrevious} className="px-8">
        Back
      </Button>
      <Button
        type="button"
        onClick={onNext}
        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};

export default TestsActions;
