import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { GitCompare, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SchoolBasicInfo from "./SchoolBasicInfo";
import SchoolRankings from "./SchoolRankings";
import SchoolCost from "./SchoolCost";
import SchoolStatistics from "./SchoolStatistics";
import SchoolPrograms from "./SchoolPrograms";
import { School } from "../entities/school/SchoolsData";

interface SchoolCardProps {
  school: School;
  index: number;
  isFavorite: boolean;
  toggleFavorite: (schoolId: number) => void;
  onCompare?: (schoolId: number, checked: boolean) => void;
  isInCompareList?: boolean;
}
const SchoolCard = ({
  school,
  index,
  isFavorite,
  toggleFavorite,
  onCompare,
  isInCompareList = false,
}: SchoolCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/school/${school.id}`);
  };

  const handleCompareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const nextChecked = !isInCompareList;
    onCompare?.(school.id, nextChecked);
  };

  return (
    <motion.div
      key={school.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 min-w-0">
          {/* Logo, Basic Info and Rankings */}
          <div className="flex flex-col gap-2 w-full md:w-1/3 min-w-0">
            <SchoolBasicInfo
              name={school.name}
              location={school.location}
              logo={school.logo}
              isFavorite={isFavorite}
              toggleFavorite={() => toggleFavorite(school.id)}
            />

            {/* Rankings */}
            <div className="min-w-0">
              <SchoolRankings rankings={school.ranking} />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-2">
              <Link
                className="w-full sm:w-auto flex-1"
                to={`/dashboard/schools/${school.id}`}
              >
                <Button
                  variant="outline"
                  className="flex-1 bg-purple-900/20 text-purple-400 border-purple-800 hover:bg-purple-800/30 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-800/30"
                >
                  School Details
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                className={`flex items-center gap-1 ${
                  isInCompareList
                    ? "bg-green-900/20 text-green-400 border-green-800 hover:bg-green-800/30 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-800/30"
                    : "bg-blue-900/20 text-blue-400 border-blue-800 hover:bg-blue-800/30 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-800/30"
                }`}
                onClick={handleCompareClick}
              >
                {isInCompareList ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added
                  </>
                ) : (
                  <>
                    <GitCompare className="h-4 w-4" />
                    Compare
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
              {/* Cost */}
              <div className="min-w-0">
                <SchoolCost
                  inState={school.cost.inState}
                  outState={school.cost.outState}
                />
              </div>

              {/* Statistics */}
              <div className="min-w-0">
                <SchoolStatistics school={school} />
              </div>
              {/* Programs */}
              <div className="md:col-span-2 min-w-0">
                <SchoolPrograms programs={school.programs} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SchoolCard;
