import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

interface LORMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (method: "self" | "other") => void;
}

const LORMethodModal: React.FC<LORMethodModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [selectedMethod, setSelectedMethod] = React.useState<"self" | "other">(
    "self"
  );

  const handleSaveAndContinue = () => {
    onSelect(selectedMethod);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white">
            Select Your Recommendation Method
          </DialogTitle>
          <DialogDescription className="text-lg text-purple-600 dark:text-purple-400 mt-2">
            How do you want to handle your recommendation letter?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedMethod}
            onValueChange={(value) =>
              setSelectedMethod(value as "self" | "other")
            }
          >
            <div className="flex items-center space-x-2 py-2">
              <RadioGroupItem value="self" id="option-self" />
              <Label htmlFor="option-self" className="text-lg">
                Write the recommendation letter yourself.
              </Label>
            </div>
            <div className="flex items-center space-x-2 py-2">
              <RadioGroupItem value="other" id="option-other" />
              <Label htmlFor="option-other" className="text-lg">
                Ask someone else to recommend you.
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
            onClick={handleSaveAndContinue}
          >
            Save and Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LORMethodModal;
