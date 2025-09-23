import { Tag } from "../ui/tag";

interface SchoolProgramsProps {
  programs: string[];
}

const SchoolPrograms = ({ programs }: SchoolProgramsProps) => {
  if (!programs?.length) return null;

  return (
    <div className="rounded-lg bg-gray-100/70 dark:bg-gray-800/60 p-3 md:p-4 min-w-0">
      <h4 className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 md:mb-3">
        Programs
      </h4>

      <div className="flex flex-wrap gap-1.5 md:gap-2 min-w-0">
        {programs.map((program, idx) => (
          <Tag
            key={`${program}-${idx}`}
            title={program}
            className="
              max-w-full truncate
              bg-blue-100 text-blue-700
              dark:bg-blue-900/30 dark:text-blue-300
              text-[11px] md:text-xs
              px-2 py-1 md:px-2.5 md:py-1.5
              rounded-md
            "
          >
            {program}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default SchoolPrograms;
