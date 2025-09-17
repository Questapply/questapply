import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  getSopSampleBundle,
  saveSopPrefs,
  type SopProgram,
  type SopSampleItem,
} from "@/api/sopApi";

function derivePrograms(arr: SopSampleItem[]): SopProgram[] {
  const map = new Map<number, string>();
  for (const it of arr) {
    if (it.program_id && it.program_name)
      map.set(it.program_id, it.program_name);
  }
  return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

function deriveLevels(arr: SopSampleItem[]): string[] {
  const set = new Set<string>();
  for (const it of arr) if (it.level) set.add(it.level);
  return Array.from(set).sort();
}

export default function SampleSopGallery() {
  const { toast } = useToast();

  // filter options + defaults
  const [programs, setPrograms] = useState<SopProgram[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");

  // items
  const [items, setItems] = useState<SopSampleItem[]>([]);
  const [paging, setPaging] = useState<{
    limit: number;
    offset: number;
    total: number;
  }>({
    limit: 30,
    offset: 0,
    total: 0,
  });

  // ui state
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(9);

  // initial load (with user defaults returned by server)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingFilters(true);
        setApiError(null);
        const bundle = await getSopSampleBundle(); // بدون پارامتر: سرور از usermeta می‌خواند
        const itemsFromApi = bundle?.items ?? [];
        // اگر filters از سرور نیامد، از آیتم‌ها بساز
        let progs = bundle?.filters?.programs ?? [];
        let lvls = bundle?.filters?.levels ?? [];
        if (progs.length === 0) progs = derivePrograms(itemsFromApi);
        if (lvls.length === 0) lvls = deriveLevels(itemsFromApi);

        if (cancelled) return;

        setPrograms(progs);
        setLevels(lvls);

        const defProg = bundle.filters.selected.program_id
          ? String(bundle.filters.selected.program_id)
          : "All";
        const defLevel = bundle.filters.selected.level || "All";

        setSelectedProgram(
          bundle?.filters?.selected?.program_id
            ? String(bundle.filters.selected.program_id)
            : "All"
        );
        setSelectedLevel(bundle?.filters?.selected?.level ?? "All");

        setItems(itemsFromApi);
        setPaging(
          bundle?.paging ?? { limit: 30, offset: 0, total: itemsFromApi.length }
        );
        setVisibleCount(9);
      } catch (e: any) {
        const msg = e?.message || "Failed to load samples";
        setApiError(msg);
        toast({
          title: "Load failed",
          description: msg,
          variant: "destructive",
        });
      } finally {
        if (!cancelled) setLoadingFilters(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  // action: Filter sample
  async function handleFilter() {
    setLoadingItems(true);
    setApiError(null);

    try {
      const bundle = await getSopSampleBundle({
        programId: selectedProgram !== "All" ? Number(selectedProgram) : null,
        level: selectedLevel !== "All" ? selectedLevel : null,
        limit: 30,
        offset: 0,
      });
      const itemsFromApi = bundle?.items ?? [];
      let progs = bundle?.filters?.programs ?? [];
      let lvls = bundle?.filters?.levels ?? [];
      if (progs.length === 0) progs = derivePrograms(itemsFromApi);
      if (lvls.length === 0) lvls = deriveLevels(itemsFromApi);

      setPrograms(progs);
      setLevels(lvls);
      setItems(itemsFromApi);
      setPaging(
        bundle?.paging ?? { limit: 30, offset: 0, total: itemsFromApi.length }
      );
      setVisibleCount(9);

      // ذخیره‌ی prefs (اختیاری؛ خطاها را نادیده بگیر)
      saveSopPrefs({
        program_id: selectedProgram !== "All" ? Number(selectedProgram) : null,
        level: selectedLevel !== "All" ? selectedLevel : null,
      }).catch(() => {});
    } catch (e: any) {
      const msg = e?.message || "Failed to filter samples";
      setApiError(msg);
      toast({
        title: "Filter failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoadingItems(false);
    }
  }
  const visible = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Sample Statements of Purpose
        </h2>

        {/* Filters + button */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Degree Level */}
            <div className="w-full md:w-72">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Degree Level
              </label>
              <Select
                value={selectedLevel}
                onValueChange={(v) => setSelectedLevel(v)}
                disabled={loadingFilters}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Degree Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Degrees</SelectItem>
                  {levels.map((lv) => (
                    <SelectItem key={lv} value={lv}>
                      {lv}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Program */}
            <div className="w-full md:w-72">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Program
              </label>
              <Select
                value={selectedProgram}
                onValueChange={(v) => setSelectedProgram(v)}
                disabled={loadingFilters}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Programs</SelectItem>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Button
              onClick={handleFilter}
              disabled={loadingFilters || loadingItems}
            >
              {loadingItems ? "Filtering…" : "Filter sample"}
            </Button>
          </div>
        </div>

        {apiError && (
          <div className="text-sm text-red-500 dark:text-red-400 mb-4">
            {apiError}
          </div>
        )}

        {/* Grid */}
        {loadingItems && !items.length ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No samples found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((sample, i) => (
                <motion.div
                  key={`${sample.id}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  whileHover={{
                    y: -5,
                    boxShadow:
                      "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                  }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="h-2 bg-gradient-to-r from-purple-600 to-blue-500" />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-gray-900 dark:text-white line-clamp-2">
                        {sample.title || "SOP Sample"}
                      </div>
                      <div className="text-xs text-gray-500 ml-3">
                        {sample.ext?.toUpperCase() || ""}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {sample.program_name} • {sample.level || "-"}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-xs text-gray-500">
                        {sample.file_size_kb
                          ? `File size: ${sample.file_size_kb} KB`
                          : ""}
                      </div>
                      <a
                        href={sample.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded bg-purple-600 text-white text-sm hover:bg-purple-700"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {items.length > visible.length && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                  onClick={() => setVisibleCount((c) => c + 9)}
                >
                  Load More Samples
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
