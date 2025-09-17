
import React, { useState } from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Progress } from "../../ui/progress";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Mail,
  TrendingUp,
  Award,
  Timer
} from "lucide-react";

interface Decision {
  id: string;
  university: string;
  program: string;
  submittedDate: string;
  expectedDecisionDate: string;
  actualDecisionDate?: string;
  status: "pending" | "accepted" | "rejected" | "waitlisted" | "interview";
  scholarshipStatus?: "none" | "partial" | "full" | "pending";
  scholarshipAmount?: number;
  responseDeadline?: string;
  acceptanceRate: number;
  notes?: string;
}

const Decision = () => {
  const [decisions] = useState<Decision[]>([
    {
      id: "1",
      university: "Stanford University",
      program: "MS Computer Science",
      submittedDate: "2023-12-01",
      expectedDecisionDate: "2024-03-15",
      status: "pending",
      scholarshipStatus: "pending",
      acceptanceRate: 4.3,
      notes: "Strong program match, competitive applicant pool"
    },
    {
      id: "2",
      university: "MIT",
      program: "PhD Artificial Intelligence",
      submittedDate: "2023-11-28",
      expectedDecisionDate: "2024-02-28",
      actualDecisionDate: "2024-02-25",
      status: "accepted",
      scholarshipStatus: "full",
      scholarshipAmount: 45000,
      responseDeadline: "2024-04-15",
      acceptanceRate: 3.7,
      notes: "Full funding package includes research assistantship"
    },
    {
      id: "3",
      university: "UC Berkeley",
      program: "MS Data Science",
      submittedDate: "2023-11-30",
      expectedDecisionDate: "2024-03-01",
      actualDecisionDate: "2024-02-28",
      status: "waitlisted",
      acceptanceRate: 8.5,
      notes: "Waitlisted - letter of continued interest recommended"
    },
    {
      id: "4",
      university: "Carnegie Mellon",
      program: "MS Machine Learning",
      submittedDate: "2023-12-15",
      expectedDecisionDate: "2024-03-30",
      status: "interview",
      acceptanceRate: 5.2,
      notes: "Interview scheduled for March 10th"
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "waitlisted":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"><Clock className="h-3 w-3 mr-1" />Waitlisted</Badge>;
      case "interview":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"><Calendar className="h-3 w-3 mr-1" />Interview</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getScholarshipBadge = (status?: string, amount?: number) => {
    if (!status || status === "none") return null;
    
    switch (status) {
      case "full":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><Award className="h-3 w-3 mr-1" />Full Funding</Badge>;
      case "partial":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"><DollarSign className="h-3 w-3 mr-1" />Partial ${amount?.toLocaleString()}</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"><Clock className="h-3 w-3 mr-1" />Funding Pending</Badge>;
      default:
        return null;
    }
  };

  const getDaysUntilResponse = (deadline?: string) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const acceptedCount = decisions.filter(d => d.status === "accepted").length;
  const pendingCount = decisions.filter(d => d.status === "pending").length;
  const waitlistedCount = decisions.filter(d => d.status === "waitlisted").length;
  const interviewCount = decisions.filter(d => d.status === "interview").length;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Admission Decisions</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Track admission decisions and manage your responses across all applications.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Waitlisted</p>
                <p className="text-2xl font-bold text-amber-600">{waitlistedCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Interviews</p>
                <p className="text-2xl font-bold text-purple-600">{interviewCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decisions List */}
      <div className="space-y-4">
        {decisions.map((decision) => (
          <Card key={decision.id} className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{decision.university}</CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">{decision.program}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {getStatusBadge(decision.status)}
                  {getScholarshipBadge(decision.scholarshipStatus, decision.scholarshipAmount)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Timeline and Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Submitted: {new Date(decision.submittedDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {decision.actualDecisionDate 
                        ? `Decided: ${new Date(decision.actualDecisionDate).toLocaleDateString()}`
                        : `Expected: ${new Date(decision.expectedDecisionDate).toLocaleDateString()}`
                      }
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Acceptance Rate: {decision.acceptanceRate}%</span>
                  </div>
                  
                  {decision.responseDeadline && (
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        Response Due: {new Date(decision.responseDeadline).toLocaleDateString()}
                        <span className={`ml-1 ${getDaysUntilResponse(decision.responseDeadline)! < 7 ? 'text-red-600' : 'text-gray-600'}`}>
                          ({getDaysUntilResponse(decision.responseDeadline)} days left)
                        </span>
                      </span>
                    </div>
                  )}
                </div>
                
                {decision.scholarshipStatus && decision.scholarshipStatus !== "none" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {decision.scholarshipStatus === "full" && "Full Funding"}
                        {decision.scholarshipStatus === "partial" && `Partial: $${decision.scholarshipAmount?.toLocaleString()}/year`}
                        {decision.scholarshipStatus === "pending" && "Funding Decision Pending"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {decision.notes && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{decision.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                {decision.status === "accepted" && (
                  <>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Offer
                    </Button>
                    <Button size="sm" variant="outline">
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline Offer
                    </Button>
                  </>
                )}
                
                {decision.status === "waitlisted" && (
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Continued Interest Letter
                  </Button>
                )}
                
                {decision.status === "interview" && (
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Button>
                )}
                
                <Button size="sm" variant="outline">
                  View Decision Letter
                </Button>
                
                <Button size="sm" variant="outline">
                  Compare Programs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Decision;
