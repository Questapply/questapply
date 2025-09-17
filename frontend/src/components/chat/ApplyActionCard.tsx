// chat/ApplyActionCard.tsx
import React, { useState } from "react";
import { Button } from "../ui/button";

type Props = {
  label?: string;
  explain?: string;
  onApply: () => Promise<void> | void;
  onDismiss?: () => void;
};

function ApplyActionCard({
  label = "Apply",
  explain,
  onApply,
  onDismiss,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    try {
      setBusy(true);
      await onApply();
      setApplied(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="my-2 rounded-xl border border-border bg-card p-3 shadow-sm">
      {explain ? (
        <p className="mb-2 text-sm text-muted-foreground">{explain}</p>
      ) : null}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleApply}
          disabled={busy || applied}
          className="h-8"
        >
          {busy ? "Applying..." : applied ? "Applied ✓" : label}
        </Button>
        {onDismiss ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={onDismiss}
            disabled={busy}
          >
            Dismiss
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default ApplyActionCard;
