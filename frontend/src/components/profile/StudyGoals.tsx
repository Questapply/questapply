import React, { useState, useEffect } from "react";
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

// استخراج countryMap از server.js
const countryMap = {
  24: "United States",
  25: "Canada",
  233: "England",
  363: "Germany",
  298: "Italy",
};

// ایجاد آرایه کشورها برای نمایش در select
const countryOptions = Object.entries(countryMap).map(([id, name]) => ({
  id,
  name,
  flag: getCountryFlag(name),
}));

// تابع دریافت پرچم کشور بر اساس نام
function getCountryFlag(countryName: string): string {
  const countryFlags: Record<string, string> = {
    "United States": "🇺🇸",
    Canada: "🇨🇦",
    England: "🇬🇧",
    Germany: "🇩🇪",
    Italy: "🇮🇹",
  };

  return countryFlags[countryName] || "🌍";
}

const StudyGoals: React.FC<StudyGoalsProps> = ({ onNext, data }) => {
  // اضافه کردن log برای بررسی داده‌های دریافتی

  // بررسی و تطبیق level با مقادیر ممکن
  const normalizeLevel = (level: string): string => {
    // بررسی اینکه آیا level دقیقاً در studyLevels وجود دارد
    if (studyLevels.includes(level)) {
      return level;
    }

    // تطبیق مقادیر مشابه
    if (
      level.includes("Ph") ||
      level.includes("PhD") ||
      level.includes("Ph.D")
    ) {
      return "PhD";
    } else if (level.includes("Master")) {
      return "Master's Degree";
    } else if (level.includes("Bachelor")) {
      return "Bachelor's Degree";
    }

    return level;
  };

  // استفاده از داده‌های دریافتی از سرور با حالت‌های مختلف ممکن
  const [countryId, setCountryId] = useState<string>(() => {
    if (typeof data.country === "object" && data.country?.id) {
      return String(data.country.id);
    }
    return "";
  });

  const [level, setLevel] = useState(() => normalizeLevel(data.level || ""));

  const [fieldId, setFieldId] = useState<string>(() => {
    if (typeof data.field === "object" && data.field?.id) {
      return String(data.field.id);
    }
    return "";
  });

  const [availableFields, setAvailableFields] = useState<
    Array<{ id: string; name: string }>
  >(data.availableFields || []);

  const [errors, setErrors] = useState({
    country: false,
    level: false,
    field: false,
  });

  // برای آپدیت داده‌ها وقتی props تغییر می‌کند
  useEffect(() => {
    // آپدیت countryId
    if (typeof data.country === "object" && data.country?.id) {
      setCountryId(String(data.country.id));
    }

    // آپدیت level با normalization
    if (data.level) {
      const normalizedLevel = normalizeLevel(data.level);
      setLevel(normalizedLevel);
    }

    // آپدیت fieldId
    if (typeof data.field === "object" && data.field?.id) {
      setFieldId(String(data.field.id));
    }

    // آپدیت availableFields
    if (data.availableFields && data.availableFields.length > 0) {
      // حذف موارد تکراری از availableFields با استفاده از Map برای اطمینان از یکتا بودن بر اساس ID
      const uniqueFieldsMap = new Map();
      data.availableFields.forEach((field) => {
        if (field.id) {
          // اطمینان از اینکه ID همیشه به صورت رشته است
          const fieldId = String(field.id);
          uniqueFieldsMap.set(fieldId, { ...field, id: fieldId });
        }
      });

      // اضافه کردن مقدار انتخاب شده اگر در لیست نیست
      if (typeof data.field === "object" && data.field?.id) {
        // تبدیل ID به رشته
        const fieldId = String(data.field.id);
        if (!uniqueFieldsMap.has(fieldId)) {
          uniqueFieldsMap.set(fieldId, {
            id: fieldId,
            name: data.field.name || "Selected Program",
          });
        }
      }

      // تبدیل Map به آرایه
      const uniqueFields = Array.from(uniqueFieldsMap.values());

      setAvailableFields(uniqueFields);

      // اگر fieldId قبلاً تنظیم شده باشد اما در availableFields نباشد
      if (typeof data.field === "object" && data.field?.id && !fieldId) {
        setFieldId(data.field.id);
      }
    }
  }, [data]);

  // اضافه کردن useEffect جدید برای اطمینان از وجود مقادیر انتخاب شده در لیست‌ها
  useEffect(() => {
    // بررسی وجود level در studyLevels
    if (level && level.length > 0) {
      const levelExists = studyLevels.includes(level);
      if (!levelExists) {
        const normalizedLevel = normalizeLevel(level);
        setLevel(normalizedLevel);
      }
    }

    // بررسی وجود field انتخاب شده در لیست
    if (fieldId && availableFields.length > 0) {
      const fieldExists = availableFields.some((field) => field.id === fieldId);

      if (
        !fieldExists &&
        typeof data.field === "object" &&
        data.field?.id &&
        data.field?.name
      ) {
        // افزودن به لیست موجود با استفاده از Map برای حذف موارد تکراری
        setAvailableFields((prev) => {
          // ایجاد یک Map از آیتم‌های موجود
          const fieldsMap = new Map();
          prev.forEach((field) => {
            // اطمینان از اینکه ID همیشه به صورت رشته است
            const fieldId = String(field.id);
            fieldsMap.set(fieldId, { ...field, id: fieldId });
          });

          // افزودن یا جایگزینی آیتم جدید
          if (data.field?.id) {
            const fieldId = String(data.field.id);
            fieldsMap.set(fieldId, {
              id: fieldId,
              name: data.field.name || "Selected Program",
            });
          }

          // تبدیل Map به آرایه
          return Array.from(fieldsMap.values());
        });
      }
    }
  }, [level, fieldId, availableFields, data.field]);

  const handleNext = () => {
    // Validate
    const newErrors = {
      country: !countryId,
      level: !level,
      field: !fieldId,
    };

    setErrors(newErrors);

    if (!Object.values(newErrors).includes(true)) {
      // فرمت ارسال داده‌ها به سرور
      onNext({
        country: {
          id: String(countryId),
          name: countryMap[countryId] || "",
        },
        level,
        field: {
          id: String(fieldId),
          name:
            availableFields.find((f) => String(f.id) === fieldId)?.name || "",
        },
      });
    }
  };

  const handlePrevious = () => {
    // Go back to the previous section (Education)
    onNext({ type: "back" });
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
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
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1,
      },
    },
  };

  // دریافت نام کشور بر اساس ID
  const getCountryName = (id: string): string => {
    return countryMap[id] || "";
  };

  // دریافت نام برنامه تحصیلی بر اساس ID
  const getFieldName = (id: string): string => {
    const field = availableFields.find((f) => f.id === id);
    return field ? field.name : "";
  };

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

          <div className="space-y-2">
            <Label htmlFor="field">What field do you want to study?</Label>
            <Select value={fieldId} onValueChange={setFieldId}>
              <SelectTrigger
                id="field"
                className={`w-full ${
                  errors.field ? "border-red-500 dark:border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select field of study" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {availableFields.length > 0 ? (
                  (() => {
                    // بررسی وجود آیتم‌های تکراری قبل از رندر
                    const fieldIds = availableFields.map((field) => field.id);
                    const duplicates = fieldIds.filter(
                      (id, index) => fieldIds.indexOf(id) !== index
                    );
                    if (duplicates.length > 0) {
                      console.error("Duplicate field IDs found:", duplicates);
                    }

                    // استفاده از Set برای اطمینان از یکتا بودن آیتم‌ها براساس ID
                    const uniqueFieldsMap = new Map();
                    availableFields.forEach((field) => {
                      if (field.id) {
                        // همیشه تبدیل به رشته
                        const fieldId = String(field.id);
                        uniqueFieldsMap.set(fieldId, { ...field, id: fieldId });
                      }
                    });

                    // تبدیل به آرایه و مرتب‌سازی
                    const uniqueFields = Array.from(uniqueFieldsMap.values());

                    return uniqueFields.map((field, index) => (
                      <SelectItem
                        // ترکیب index با ID برای اطمینان از یکتا بودن
                        key={`field-${field.id}-${index}`}
                        value={field.id}
                      >
                        {field.name}
                      </SelectItem>
                    ));
                  })()
                ) : (
                  <div className="p-2 text-center text-gray-500">
                    Loading fields...
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
              !availableFields.some((field) => field.id === fieldId) && (
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
