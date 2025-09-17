import React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

interface MinimalProgramForApply {
  id: number;
  contact?: { website?: string };
}

interface ApplyYourselfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeApplication: number | null;
  applications: MinimalProgramForApply[];
}

const ApplyYourselfDialog = ({
  open,
  onOpenChange,
  activeApplication,
  applications,
}: ApplyYourselfDialogProps) => {
  const { toast } = useToast();
  const selected =
    applications?.find((a) => a.id === activeApplication) || null;

  const rawUrl = (selected?.contact?.website || "").trim();

  const applyUrl =
    rawUrl && !/^https?:\/\//i.test(rawUrl) ? `https://${rawUrl}` : rawUrl;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Yourself</DialogTitle>
          <DialogDescription>
            You are about to apply independently to this program without
            QuestApply's submission assistance.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-6">
              <User className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </motion.div>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
            You will be responsible for submitting all application materials
            directly to the institution.
          </p>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {applyUrl ? (
            // استفاده از asChild تا استایل Button بماند و پاپ‌آپ هم بلاک نشود
            <Button asChild onClick={() => onOpenChange(false)}>
              <a href={applyUrl} target="_blank" rel="noopener noreferrer">
                Accept
              </a>
            </Button>
          ) : (
            <Button
              variant="secondary"
              disabled
              title="No website found for this program"
            >
              Accept
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyYourselfDialog;
