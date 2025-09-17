// src/components/lor/LorSamples.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { toast } from "../../hooks/use-toast";
import {
  fetchSamples,
  fetchSampleById,
  LorSampleItem,
  setSelectedTemplateId,
} from "../../api/lorApi";

type Props = {
  onUseTemplate?: () => void; // اختیاری: اگر می‌خوای بعد از Use تب رو عوض کنی
};

const TYPES = [
  { value: "all", label: "All" },
  { value: "Professor", label: "Professor" },
  { value: "Colleague", label: "Colleague" },
  { value: "Supervisor", label: "Supervisor" },
  { value: "Classmate", label: "Classmate" },
  { value: "Mentor", label: "Mentor" },
  { value: "Research Advisor", label: "Research Advisor" },
];

const LorSamples: React.FC<Props> = ({ onUseTemplate }) => {
  const [type, setType] = useState<string>("Professor");
  const [items, setItems] = useState<LorSampleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // modal
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<LorSampleItem | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    file_url: string;
    ext: string;
    title: string | null;
  } | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  // fetch list
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    fetchSamples(type)
      .then((list) => {
        if (!alive) return;
        setItems(list);
      })
      .catch((e) => {
        if (!alive) return;
        setErr(e?.message || "Failed to load samples.");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [type]);

  const onView = async (it: LorSampleItem) => {
    setActive(it);
    setOpen(true);
    setLoadingFile(true);
    try {
      const f = await fetchSampleById(it.id);
      setFileInfo(f);
    } catch (e: any) {
      setFileInfo(null);
      toast({
        title: "Error",
        description: e?.message || "Failed to load sample file.",
        variant: "destructive",
      });
    } finally {
      setLoadingFile(false);
    }
  };

  const onUse = () => {
    if (!active) return;
    setSelectedTemplateId(active.id);
    toast({
      title: "Template selected",
      description: "This template will be used for preview/export.",
    });
    setOpen(false);
    if (onUseTemplate) onUseTemplate(); // اگر خواستی تب رو عوض کنی
  };

  const grid = useMemo(
    () =>
      loading ? (
        <div className="text-sm text-gray-500">Loading samples...</div>
      ) : err ? (
        <div className="text-sm text-red-500">{err}</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500">No samples found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <div
              key={it.id}
              className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white/5 dark:bg-gray-800/30"
            >
              {/* Preview (fills the card top) */}
              <div className="aspect-[4/3] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-hidden grid place-items-center">
                {it.ext?.match(/png|jpe?g|gif/i) ? (
                  <img
                    src={it.file_url}
                    alt={it.title || "sample"}
                    className="max-w-full max-h-full"
                  />
                ) : it.preview_img_url ? (
                  <img
                    src={it.preview_img_url}
                    alt={it.title || "sample"}
                    className="max-w-full max-h-full"
                  />
                ) : (
                  <div className="text-xs text-gray-500">
                    {(it.ext || "FILE").toString().toUpperCase()} preview
                  </div>
                )}
              </div>

              {/* actions */}
              <div className="p-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onView(it)}
                >
                  View Sample
                </Button>
              </div>
            </div>
          ))}
        </div>
      ),
    [items, loading, err]
  );

  return (
    <div className="animate-fade-in">
      {/* Filter */}
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm font-medium">Type of Recommender</div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-9 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {grid}

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {active?.title || (active ? `Sample #${active.id}` : "Sample")}
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-[360px] border border-dashed border-gray-200 dark:border-gray-700 rounded-md grid place-items-center p-3 bg-white dark:bg-gray-900">
            {loadingFile ? (
              <div className="text-sm text-gray-500">Loading file...</div>
            ) : !fileInfo ? (
              <div className="text-sm text-gray-500">No preview available.</div>
            ) : fileInfo.ext.match(/png|jpe?g|gif/i) ? (
              <img
                src={fileInfo.file_url}
                alt={fileInfo.title || "sample"}
                className="max-w-full max-h-[80vh]"
              />
            ) : fileInfo.ext.match(/pdf/i) ? (
              <iframe
                src={fileInfo.file_url}
                className="w-full h-[60vh] rounded"
                title={fileInfo.title || "PDF"}
              />
            ) : (
              <div className="text-center text-sm">
                This is a {fileInfo.ext.toUpperCase()} file.
                <br />
                <a
                  href={fileInfo.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Open in new tab
                </a>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onUse}>Use This Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LorSamples;
