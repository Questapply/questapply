import { Tag } from "../ui/tag";

interface SchoolProgramsProps {
  programs: string[];
}

const SchoolPrograms = ({ programs }: SchoolProgramsProps) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800/60 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Programs
      </h4>
      <div className="flex flex-wrap gap-2">
        {programs.map((program, index) => (
          <Tag
            key={index}
            className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          >
            {program}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default SchoolPrograms;
