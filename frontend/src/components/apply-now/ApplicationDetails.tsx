import React from "react";
import { TableRow, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { FileX, Eye, School, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../hooks/use-toast";
import ProgressCircle from "../ui/progress-circle";
import StatCircle from "../ui/stat-circle";
import { getDocumentCompletionPercentage } from "../../utils/docs";
interface ApplicationDetailsProps {
  application: any;
  userMeta: any;
  documents: any;
  isExpanded: boolean;
}

const ApplicationDetails = ({
  application,
  userMeta,
  isExpanded,
}: ApplicationDetailsProps) => {
  const { toast } = useToast();

  return (
    <AnimatePresence>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={7} className="p-0">
            <motion.div
              className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium mb-4">Application Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Requirements Section */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h4 className="text-md font-medium mb-3 flex items-center">
                    <School className="h-4 w-4 mr-2 text-purple-500" />
                    Minimum Requirements
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>GPA</span>
                        <div>
                          <span className="font-medium">
                            Your: {userMeta.application_gpa}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            Min: {application.requirements.gpa.min}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="absolute left-0 h-full w-full flex items-center">
                          <div
                            className="h-full bg-gray-300"
                            style={{
                              width: `${
                                (application.requirements.gpa.min / 4) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="absolute left-0 h-full">
                          <div
                            className={`h-full ${
                              userMeta.application_gpa >=
                              application.requirements.gpa.min
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${(userMeta.application_gpa / 4) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="absolute top-0 left-0 px-2 h-full flex items-center justify-between w-full">
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            Min
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            You
                          </span>
                        </div>
                      </div>
                    </div>

                    {application.requirements.gre && (
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>GRE</span>
                          <div>
                            <span className="font-medium">
                              Your: {userMeta.application_gre_total}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                              Min: {application.requirements.gre.min}
                            </span>
                          </div>
                        </div>
                        <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div className="absolute left-0 h-full w-full flex items-center">
                            <div
                              className="h-full bg-gray-300"
                              style={{
                                width: `${
                                  (application.requirements.gre.min / 340) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="absolute left-0 h-full">
                            <div
                              className={`h-full ${
                                userMeta.application_gre_total >=
                                application.requirements.gre.min
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${
                                  (userMeta.application_gre_total / 340) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="absolute top-0 left-0 px-2 h-full flex items-center justify-between w-full">
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              Min
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              You
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {application.requirements.ielts && (
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>IELTS/TOEFL</span>
                          <div>
                            <span className="font-medium">
                              Your: {userMeta.application_english_score}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                              Min: {application.requirements.ielts.min}
                            </span>
                          </div>
                        </div>
                        <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div className="absolute left-0 h-full w-full flex items-center">
                            <div
                              className="h-full bg-gray-300"
                              style={{
                                width: `${
                                  (application.requirements.ielts.min / 9) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="absolute left-0 h-full">
                            <div
                              className={`h-full ${
                                userMeta.application_english_score >=
                                application.requirements.ielts.min
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${
                                  (userMeta.application_english_score / 9) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="absolute top-0 left-0 px-2 h-full flex items-center justify-between w-full">
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              Min
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              You
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Average & Program Match Section */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h4 className="text-md font-medium mb-3">
                    Average & Program Match
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>GPA</span>
                        <div>
                          <span className="font-medium">
                            Your: {userMeta.application_gpa}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            Avg:{" "}
                            {application.requirements.gpa.avg ||
                              (application.requirements.gpa.min + 0.4).toFixed(
                                1
                              )}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="absolute left-0 h-full w-full flex items-center">
                          <div
                            className="h-full bg-gray-300"
                            style={{
                              width: `${
                                ((application.requirements.gpa.avg ||
                                  application.requirements.gpa.min + 0.4) /
                                  4) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="absolute left-0 h-full">
                          <div
                            className={`h-full ${
                              userMeta.application_gpa >=
                              (application.requirements.gpa.avg ||
                                application.requirements.gpa.min + 0.4)
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }`}
                            style={{
                              width: `${(userMeta.application_gpa / 4) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="absolute top-0 left-0 px-2 h-full flex items-center justify-between w-full">
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            Avg
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            You
                          </span>
                        </div>
                      </div>
                    </div>

                    {application.requirements.gre && (
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>GRE</span>
                          <div>
                            <span className="font-medium">
                              Your: {userMeta.application_gre_total}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                              Avg:{" "}
                              {application.requirements.gre.total.avg ||
                                application.requirements.gre.min + 20}
                            </span>
                          </div>
                        </div>
                        <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div className="absolute left-0 h-full w-full flex items-center">
                            <div
                              className="h-full bg-gray-300"
                              style={{
                                width: `${
                                  ((application.requirements.gre.total.avg ||
                                    application.requirements.gre.min + 20) /
                                    340) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="absolute left-0 h-full">
                            <div
                              className={`h-full ${
                                userMeta.application_gre_total >=
                                (application.requirements.gre.total.avg ||
                                  application.requirements.gre.min + 20)
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                              }`}
                              style={{
                                width: `${
                                  (userMeta.application_gre_total / 340) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="absolute top-0 left-0 px-2 h-full flex items-center justify-between w-full">
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              Avg
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              You
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {application.requirements.ielts && (
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>IELTS/TOEFL</span>
                          <div>
                            <span className="font-medium">
                              Your: {userMeta.application_english_score}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                              Avg:{" "}
                              {application.requirements.ielts.avg ||
                                application.requirements.ielts.min + 1}
                            </span>
                          </div>
                        </div>
                        <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div className="absolute left-0 h-full w-full flex items-center">
                            <div
                              className="h-full bg-gray-300"
                              style={{
                                width: `${
                                  ((application.requirements.ielts.avg ||
                                    application.requirements.ielts.min + 1) /
                                    9) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="absolute left-0 h-full">
                            <div
                              className={`h-full ${
                                userMeta.application_english_score >=
                                (application.requirements.ielts.avg ||
                                  application.requirements.ielts.min + 1)
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                              }`}
                              style={{
                                width: `${
                                  (userMeta.application_english_score / 9) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="absolute top-0 left-0 px-2 h-full flex items-center justify-between w-full">
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              Avg
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              You
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center mt-2">
                      <StatCircle
                        value={application.admissionRate}
                        label="Program Match"
                        color={
                          application.admissionRate > 70
                            ? "green"
                            : application.admissionFitPercentage > 50
                            ? "yellow"
                            : "red"
                        }
                        isPercentage={true}
                        size="md"
                      />
                    </div>
                  </div>
                </div>

                {/* Documents Tracker */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h4 className="text-md font-medium mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    Application Documents
                  </h4>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completion</span>
                      <span>
                        {getDocumentCompletionPercentage(application.documents)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={getDocumentCompletionPercentage(
                        application.documents
                      )}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {application.documents.map((doc: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <span className="truncate max-w-[150px]">
                          {doc.name}
                        </span>
                        {doc.status === "completed" && (
                          <Badge className="bg-green-500">Completed</Badge>
                        )}
                        {doc.status === "pending" && (
                          <Badge className="bg-yellow-500">Pending</Badge>
                        )}
                        {doc.status === "not_started" && (
                          <Badge variant="outline">Not Started</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                  onClick={() => {
                    toast({
                      title: "Application Removed",
                      description:
                        "The application has been removed from your list.",
                      variant: "destructive",
                    });
                  }}
                >
                  <FileX className="h-4 w-4 mr-1" />
                  Remove
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Application Details",
                      description: "Viewing full application details",
                    });
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  See More Details
                </Button>
              </div>
            </motion.div>
          </TableCell>
        </TableRow>
      )}
    </AnimatePresence>
  );
};

export default ApplicationDetails;
