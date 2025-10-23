import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Globe, ArrowRight } from "lucide-react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input"; // ⬅️ اضافه شد
import { studyLevels } from "../../lib/constants/study-options";

interface StudyGoalsProps {
  onNext: (data: any) => void;
  data: {
    country: any;
    level: string;
    field: any;
    availableFields?: Array<{ id: string; name: string }>;
  };
}

// لیست دستی کشورها
const countryMap: Record<number, string> = {
  24: "United States of America (USA)",
  25: "Canada (CA)",
  233: "England",
  363: "Germany",
  298: "Italy",
  380: "Australia",
  528: "Austria",
  540: "Belgium",
  490: "Denmark",
  539: "Finland",
  393: "France",
  578: "Ireland",
  447: "Netherlands",
  538: "Norway",
  499: "Spain",
  460: "Sweden",
  479: "Switzerland",
};

// نرمالایزر برای حذف پرانتزها (مثل (USA), (CA))
const baseName = (name: string) => name.replace(/\s*\([^)]+\)\s*/g, "").trim();

// پرچم کشورها
function getCountryFlag(countryName: string): string {
  switch (baseName(countryName).toLowerCase()) {
    case "united states of america":
    case "united states":
    case "usa":
      return "🇺🇸";
    case "canada":
      return "🇨🇦";
    case "england":
    case "united kingdom":
    case "uk":
      return "🇬🇧";
    case "germany":
      return "🇩🇪";
    case "italy":
      return "🇮🇹";
    case "australia":
      return "🇦🇺";
    case "austria":
      return "🇦🇹";
    case "belgium":
      return "🇧🇪";
    case "denmark":
      return "🇩🇰";
    case "finland":
      return "🇫🇮";
    case "france":
      return "🇫🇷";
    case "ireland":
      return "🇮🇪";
    case "netherlands":
      return "🇳🇱";
    case "norway":
      return "🇳🇴";
    case "spain":
      return "🇪🇸";
    case "sweden":
      return "🇸🇪";
    case "switzerland":
      return "🇨🇭";
    default:
      return "🌍";
  }
}
const countryNameToId = Object.entries(countryMap).reduce<
  Record<string, string>
>((acc, [id, name]) => {
  acc[baseName(name).toLowerCase()] = id; // "United States (USA)" → "united states"
  return acc;
}, {});

const findCountryId = (input: any): string => {
  if (!input) return "";
  if (typeof input === "string") {
    const k = baseName(input).toLowerCase();
    return countryNameToId[k] || "";
  }
  if (typeof input === "object") {
    if (input.id) return String(input.id);
    if (input.name) {
      const k = baseName(input.name).toLowerCase();
      return countryNameToId[k] || "";
    }
  }
  return "";
};

// آپشن‌های کامپوننت Select
const countryOptions = Object.entries(countryMap).map(([id, name]) => ({
  id,
  name,
  flag: getCountryFlag(name),
}));
const findFieldId = (
  input: any,
  list: Array<{ id: string; name: string }>
): string => {
  if (!input) return "";
  if (typeof input === "object" && input.id) return String(input.id);
  const name = typeof input === "string" ? input : input?.name;
  if (!name) return "";
  const item = list.find(
    (f) => f.name?.toLowerCase() === String(name).toLowerCase()
  );
  return item ? String(item.id) : "";
};
// (اختیاری) اگر می‌خوای در UI نام بدون پرانتز دیده شود:
const displayCountryName = (name: string) => baseName(name);
const StudyGoals: React.FC<StudyGoalsProps> = ({ onNext, data }) => {
  const normalizeLevel = (level: string): string => {
    if (studyLevels.includes(level)) return level;
    if (level.includes("Ph") || level.includes("PhD") || level.includes("Ph.D"))
      return "PhD";
    if (level.includes("Master")) return "Master's Degree";
    if (level.includes("Bachelor")) return "Bachelor's Degree";
    return level;
  };
  const [countryId, setCountryId] = useState<string>(() =>
    findCountryId(data.country)
  );

  const [level, setLevel] = useState(() => normalizeLevel(data.level || ""));

  const [fieldId, setFieldId] = useState<string>(() =>
    findFieldId(data.field, data.availableFields || [])
  );

  const [availableFields, setAvailableFields] = useState<
    Array<{ id: string; name: string }>
  >(data.availableFields || []);

  // 🔎 state برای جستجوی فیلد
  const [fieldSearch, setFieldSearch] = useState("");

  const [errors, setErrors] = useState({
    country: false,
    level: false,
    field: false,
  });
  const fieldSearchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const nextCountryId = findCountryId(data.country);
    if (nextCountryId) setCountryId(nextCountryId);

    // ✅ Level
    if (data.level) setLevel(normalizeLevel(data.level));

    // Helper: name → id برای فیلد
    const findFieldIdLocal = (
      input: any,
      list: Array<{ id: string; name: string }>
    ): string => {
      if (!input) return "";
      if (typeof input === "object" && input.id) return String(input.id);
      const name = typeof input === "string" ? input : input?.name;
      if (!name) return "";
      const item = list.find(
        (f) => f.name?.toLowerCase() === String(name).toLowerCase()
      );
      return item ? String(item.id) : "";
    };

    // ✅ یکتاسازی و ساخت لیست فیلدها از API
    const uniq = new Map<string, { id: string; name: string }>();
    (data.availableFields || []).forEach((f) => {
      if (f?.id)
        uniq.set(String(f.id), { id: String(f.id), name: f.name || "" });
    });

    // اگر فیلدِ انتخاب‌شده داخل لیست نیست، با name اضافه‌اش کن
    const selectedFieldIdFromData = findFieldIdLocal(
      data.field,
      Array.from(uniq.values())
    );
    if (selectedFieldIdFromData && !uniq.has(selectedFieldIdFromData)) {
      uniq.set(selectedFieldIdFromData, {
        id: selectedFieldIdFromData,
        name:
          (typeof data.field === "object"
            ? data.field?.name
            : String(data.field)) || "Selected Program",
      });
    }

    const nextFields = Array.from(uniq.values());
    if (nextFields.length) setAvailableFields(nextFields);

    // ✅ فیلد انتخاب‌شده را از روی name/id تعیین کن (بدون پاک‌کردن انتخاب موجود)
    const resolvedFieldId =
      selectedFieldIdFromData || findFieldIdLocal(data.field, nextFields);

    if (resolvedFieldId) setFieldId(resolvedFieldId);
  }, [data]);

  useEffect(() => {
    if (level && level.length > 0) {
      const levelExists = studyLevels.includes(level);
      if (!levelExists) setLevel(normalizeLevel(level));
    }

    if (fieldId && availableFields.length > 0) {
      const fieldExists = availableFields.some((field) => field.id === fieldId);
      if (
        !fieldExists &&
        typeof data.field === "object" &&
        data.field?.id &&
        data.field?.name
      ) {
        setAvailableFields((prev) => {
          const fieldsMap = new Map<string, { id: string; name: string }>();
          prev.forEach((f) =>
            fieldsMap.set(String(f.id), { ...f, id: String(f.id) })
          );
          const fid = String(data.field.id);
          fieldsMap.set(fid, {
            id: fid,
            name: data.field.name || "Selected Program",
          });
          return Array.from(fieldsMap.values());
        });
      }
    }
  }, [level, fieldId, availableFields, data.field]);

  const handleNext = () => {
    const newErrors = { country: !countryId, level: !level, field: !fieldId };
    setErrors(newErrors);
    if (!Object.values(newErrors).includes(true)) {
      onNext({
        country: { id: String(countryId), name: countryMap[countryId] || "" },
        level,
        field: {
          id: String(fieldId),
          name:
            availableFields.find((f) => String(f.id) === fieldId)?.name || "",
        },
      });
    }
  };

  const handlePrevious = () => onNext({ type: "back" });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };
  const globeAnimation = {
    hidden: { scale: 0.8, opacity: 0, rotate: -30 },
    show: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.1 },
    },
  };

  const getCountryName = (id: string): string => countryMap[id] || "";
  const getFieldName = (id: string): string =>
    availableFields.find((f) => f.id === id)?.name || "";

  // ✅ فیلتر لیست فیلدها بر اساس عبارت جستجو
  const filteredFields = (() => {
    // یکتا کردن (مثل قبل)
    const uniqueMap = new Map<string, { id: string; name: string }>();
    availableFields.forEach((f) =>
      uniqueMap.set(String(f.id), { ...f, id: String(f.id) })
    );
    let arr = Array.from(uniqueMap.values());
    if (fieldSearch.trim()) {
      const q = fieldSearch.trim().toLowerCase();
      arr = arr.filter((f) => f.name.toLowerCase().includes(q));
    }
    return arr;
  })();

  return (
    <div className="p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div variants={itemVariants} className="text-center">
          <div className="flex justify-center mb-4">
            <motion.div
              variants={globeAnimation}
              className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
            >
              <Globe className="w-10 h-10 text-green-600 dark:text-green-400" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Destination
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Tell us where and what you'd like to study so we can help you find
            the perfect program.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          {/* Country (لیست دستی) */}
          <div className="space-y-2">
            <Label htmlFor="country">
              Which country do you want to study in?
            </Label>
            <Select value={countryId} onValueChange={setCountryId}>
              <SelectTrigger
                id="country"
                className={`w-full ${
                  errors.country ? "border-red-500 dark:border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {countryOptions.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    <div className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-red-500 text-sm">Please select a country</p>
            )}
          </div>

          {/* Level */}
          <div className="space-y-2">
            <Label htmlFor="level">What level do you want to study?</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger
                id="level"
                className={`w-full ${
                  errors.level ? "border-red-500 dark:border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select degree level" />
              </SelectTrigger>
              <SelectContent>
                {studyLevels.map((levelOption) => (
                  <SelectItem key={levelOption} value={levelOption}>
                    {levelOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.level && (
              <p className="text-red-500 text-sm">
                Please select a degree level
              </p>
            )}
          </div>

          {/* Field + Search داخل Select */}
          <div className="space-y-2">
            <Label htmlFor="field">What field do you want to study?</Label>
            <Select
              value={fieldId}
              onValueChange={setFieldId}
              onOpenChange={(open) => {
                if (open) {
                  setTimeout(() => fieldSearchRef.current?.focus(), 0);
                }
              }}
            >
              <SelectTrigger
                id="field"
                className={`w-full ${
                  errors.field ? "border-red-500 dark:border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select field of study" />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                position="popper"
                sideOffset={6}
                align="start"
                avoidCollisions={false}
                className="  p-0"
              >
                {/* 🔎 نوار جستجو */}

                <div className="p-2 sticky z-10 top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                  <Input
                    ref={fieldSearchRef}
                    placeholder="Search field..."
                    value={fieldSearch}
                    onChange={(e) => setFieldSearch(e.target.value)}
                  />
                </div>

                {/* لیست فیلدها (فیلتر شده) */}

                {filteredFields.length > 0 ? (
                  filteredFields.map((field, index) => (
                    <SelectItem
                      key={`field-${field.id}-${index}`}
                      value={field.id}
                    >
                      {field.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-3 text-center text-sm text-gray-500">
                    No results
                  </div>
                )}
              </SelectContent>
            </Select>
            {errors.field && (
              <p className="text-red-500 text-sm">
                Please select a field of study
              </p>
            )}
            {fieldId &&
              availableFields.length > 0 &&
              !availableFields.some((f) => f.id === fieldId) && (
                <p className="text-amber-500 text-sm">
                  Selected field may not be available. Please select again.
                </p>
              )}
          </div>
        </motion.div>

        {countryId && level && fieldId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800/30"
          >
            <div className="flex items-center justify-center space-x-4">
              <span className="text-5xl">
                {getCountryFlag(getCountryName(countryId))}
              </span>
              <div className="text-left">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  {getCountryName(countryId)}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {level} in {getFieldName(fieldId)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={itemVariants}
          className="flex justify-between pt-6"
        >
          <Button variant="outline" onClick={handlePrevious} className="px-8">
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudyGoals;
