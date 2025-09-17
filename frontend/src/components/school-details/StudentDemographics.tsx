
import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Users } from "lucide-react";

interface DemographicData {
  type: string;
  value: number;
  color: string;
}

interface DemographicsProps {
  genderData: { men: number; women: number; total: number };
  enrollmentData: { fullTime: number; partTime: number; total: number };
  levelData: { undergraduate: number; graduate: number; total: number };
  raceData: Array<DemographicData>;
}

const StudentDemographics: React.FC<DemographicsProps> = ({ 
  genderData, enrollmentData, levelData, raceData 
}) => {
  const barData = [
    {
      name: "Gender",
      data: [
        { name: "Men", value: genderData.men, percentage: Math.round((genderData.men / genderData.total) * 100) },
        { name: "Women", value: genderData.women, percentage: Math.round((genderData.women / genderData.total) * 100) }
      ]
    },
    {
      name: "Type",
      data: [
        { name: "Full Time", value: enrollmentData.fullTime, percentage: Math.round((enrollmentData.fullTime / enrollmentData.total) * 100) },
        { name: "Part Time", value: enrollmentData.partTime, percentage: Math.round((enrollmentData.partTime / enrollmentData.total) * 100) }
      ]
    },
    {
      name: "Level",
      data: [
        { name: "Undergraduate", value: levelData.undergraduate, percentage: Math.round((levelData.undergraduate / levelData.total) * 100) },
        { name: "Graduate", value: levelData.graduate, percentage: Math.round((levelData.graduate / levelData.total) * 100) }
      ]
    }
  ];

  const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mt-8">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <Users className="h-5 w-5 text-blue-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Student Demographics</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Distribution */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Student Distribution</h3>
            <div className="grid grid-cols-1 gap-6">
              {barData.map((section, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">{section.name}</h4>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{genderData.total} Total</span>
                  </div>
                  
                  <div className="space-y-2">
                    {section.data.map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {item.value.toLocaleString()} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${i === 0 ? 'bg-purple-500 dark:bg-purple-600' : 'bg-blue-500 dark:bg-blue-600'}`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Race & Ethnicity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Race & Ethnicity Diversity</h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={raceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {raceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {raceData.map((item, idx) => (
                  <div key={idx} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentDemographics;
