import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Filter } from "lucide-react";

type SortKey = "deadline" | "qs_rank" | "MIN_GPA" | "extra_appication_fee";
type SortOrder = "asc" | "desc";

interface Props {
  sortKey: SortKey;
  sortOrder: SortOrder;
  onApply: (payload: { sortKey: SortKey; sortOrder: SortOrder }) => void;
}

const ApplicationFilters: React.FC<Props> = ({
  sortKey,
  sortOrder,
  onApply,
}) => {
  const [localSortKey, setLocalSortKey] = useState<SortKey>(sortKey);
  const [localSortOrder, setLocalSortOrder] = useState<SortOrder>(sortOrder);

  useEffect(() => {
    setLocalSortKey(sortKey);
    setLocalSortOrder(sortOrder);
  }, [sortKey, sortOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({ sortKey: localSortKey, sortOrder: localSortOrder });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mb-4">
      <div
        className="
          flex flex-col md:flex-row md:items-end gap-3 md:gap-4
          bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-4 rounded-lg
        "
      >
        {/* Order by */}
        <div className="w-full md:w-auto flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-semibold text-sm sm:text-base">
              Order by:
            </span>
          </div>

          {/* در موبایل گرید ۲ ستونه؛ در دسکتاپ مثل قبل افقی/رپ */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-none md:flex md:flex-wrap md:gap-3 md:pl-7">
            {(
              [
                "deadline",
                "qs_rank",
                "MIN_GPA",
                "extra_appication_fee",
              ] as SortKey[]
            ).map((key) => (
              <label
                key={key}
                className="flex items-center gap-1.5 cursor-pointer text-sm"
              >
                <input
                  type="radio"
                  name="orderby"
                  value={key}
                  checked={localSortKey === key}
                  onChange={() => setLocalSortKey(key)}
                  className="accent-purple-600"
                />
                <span>
                  {key === "qs_rank"
                    ? "QS Rank"
                    : key === "MIN_GPA"
                    ? "GPA"
                    : key === "extra_appication_fee"
                    ? "Application Fee"
                    : "Deadline"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Order */}
        <div className="w-full md:w-auto flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm sm:text-base">Order:</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-none md:flex md:flex-wrap md:gap-3">
            {(["asc", "desc"] as SortOrder[]).map((ord) => (
              <label
                key={ord}
                className="flex items-center gap-1.5 cursor-pointer text-sm"
              >
                <input
                  type="radio"
                  name="order"
                  value={ord}
                  checked={localSortOrder === ord}
                  onChange={() => setLocalSortOrder(ord)}
                  className="accent-purple-600"
                />
                <span className="uppercase">{ord}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Button: موبایل تمام عرض، دسکتاپ سمت راست */}
        <Button
          type="submit"
          className="
            w-full md:w-auto md:ml-auto
            flex items-center justify-center gap-2
          "
        >
          <Filter className="w-4 h-4" />
          Filter My Applications
        </Button>
      </div>
    </form>
  );
};

export default ApplicationFilters;
