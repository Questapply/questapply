import React, { useState } from "react";
import { motion } from "framer-motion";
import { CircleDollarSign } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { ProgramDetail } from "../../data/programDetails";

interface CostSectionProps {
  program: ProgramDetail;
}

type CostBreakdown = ProgramDetail["costs"]["residents"];

const normalizeCosts = (c: CostBreakdown): CostBreakdown => {
  const vals = [c.tuition, c.fees, c.healthInsurance, c.livingCost].map(Number);
  // اگر 3 تا خیلی کوچک‌اند و یکی خیلی بزرگ، یعنی واحدها یکی نیست (هزار/دلار)
  const needScale =
    vals.filter((v) => v < 1000).length >= 3 && Math.max(...vals) >= 10000;
  if (!needScale) return c;
  return {
    tuition: Number(c.tuition) * 1000,
    fees: Number(c.fees) * 1000,
    healthInsurance: Number(c.healthInsurance) * 1000,
    livingCost: Number(c.livingCost),
  };
};

const CostSection: React.FC<CostSectionProps> = ({ program }) => {
  const [activeTab, setActiveTab] = useState("residents");

  const prepareChartData = (costData: CostBreakdown) => {
    return [
      { name: "Tuition", value: costData.tuition, color: "#9b87f5" },
      { name: "Fees", value: costData.fees, color: "#90EE90" },
      {
        name: "Health Insurance",
        value: costData.healthInsurance,
        color: "#FF9999",
      },
      {
        name: "Living Cost",
        value: costData.livingCost,
        color: "#87CEEB",
      },
    ];
  };

  const residentData = prepareChartData(program.costs.residents);
  const internationalData = prepareChartData(program.costs.international);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 shadow-md rounded-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-purple-600 dark:text-purple-400">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <CircleDollarSign className="h-5 w-5 text-purple-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Cost
        </h2>
      </div>

      <div className="p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="residents" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="residents">Residents</TabsTrigger>
              <TabsTrigger value="international">International</TabsTrigger>
            </TabsList>

            <TabsContent value="residents" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Cost Breakdown
                  </h3>
                  <div className="space-y-4">
                    {residentData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          Total
                        </span>
                        <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                          {formatCurrency(
                            internationalData.reduce(
                              (sum, item) => sum + item.value,
                              0
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={residentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {residentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="international" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Cost Breakdown
                  </h3>
                  <div className="space-y-4">
                    {internationalData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          Total
                        </span>
                        <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                          {formatCurrency(
                            residentData.reduce(
                              (sum, item) => sum + (item.value || 0),
                              0
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={internationalData}
                          minAngle={3}
                          paddingAngle={1}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {internationalData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 bg-gray-50 dark:bg-gray-700/20 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Note
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The above costs are estimations for the {program.duration}{" "}
              program. Living costs may vary based on personal lifestyle and
              accommodation choices. Additional expenses such as books,
              supplies, and transportation are not included in this breakdown.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CostSection;
