import React from "react";
import { Button } from "../ui/button";
import { User, Send, FileX } from "lucide-react";

interface ApplicationActionsProps {
  onApplyYourself: () => void;
  onSubmitWithUs: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

const ApplicationActions = ({
  onApplyYourself,
  onSubmitWithUs,
  onRemove,
  showRemove = false,
}: ApplicationActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900/20"
        onClick={onApplyYourself}
      >
        <User className="h-4 w-4 mr-1" />
        Apply Yourself
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20"
        onClick={onSubmitWithUs}
      >
        <Send className="h-4 w-4 mr-1" />
        Submit with Us
      </Button>

      {showRemove && onRemove && (
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/20"
          onClick={onRemove}
        >
          <FileX className="h-4 w-4 mr-1" />
          Remove
        </Button>
      )}
    </div>
  );
};

export default ApplicationActions;
