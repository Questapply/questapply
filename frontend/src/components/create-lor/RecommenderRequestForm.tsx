import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "../../hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ChevronLeft } from "lucide-react";

import {
  sendRecommenderRequest,
  getRecommenderRequests,
  remindRecommender,
} from "../../api/lorApi";

interface RecommenderRequestFormProps {
  onBack: () => void;
  onComplete: () => void;
}

type RequestRow = {
  id: number;
  teacher_name?: string | null;
  recommender_type?: string | null;
  deadline?: string | null;
  recommend_status?: string | null;
  created?: string | null;
  // if backend returns email, we'll show it; otherwise a dash
  recommender_email?: string | null;
  email?: string | null;
};

const TYPE_OPTIONS = [
  { value: "Professor", label: "Professor" },
  { value: "Colleague", label: "Colleague" },
  { value: "Supervisor", label: "Supervisor" },
  { value: "Classmate", label: "Classmate" },
  { value: "Mentor", label: "Mentor" },
  { value: "Research Advisor", label: "Research Advisor" },
] as const;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const RecommenderRequestForm: React.FC<RecommenderRequestFormProps> = ({
  onBack,
  onComplete,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "" as (typeof TYPE_OPTIONS)[number]["value"] | "",
    deadline: "",
    message: `Dear [Recommender's Name],

I hope this message finds you well. I am applying to [specific program/job] and was wondering if you would be willing to write me a strong letter of recommendation.

I truly value the guidance and mentorship you've provided, and I believe your insights could greatly enhance my application.

If you'd like, I can provide additional information about my qualifications or the program to assist with your letter.

Please let me know if you need anything else.

Thanks,
[Your Name]`,
  });

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    type: false,
    deadline: false,
  });

  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [rows, setRows] = useState<RequestRow[]>([]);

  const loadRows = async () => {
    try {
      setLoadingList(true);
      const res = await getRecommenderRequests();
      // expect: { items: [...] }  or plain array
      const items: RequestRow[] = Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res)
        ? res
        : [];
      setRows(items);
    } catch (e: any) {
      toast({
        title: "Failed to load requests",
        description: e?.message || "Network error",
        variant: "destructive",
      });
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (id in errors && (errors as any)[id]) {
      setErrors((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleTypeChange = (value: string) => {
    setFormData((p) => ({ ...p, type: value as any }));
    if (errors.type) setErrors((prev) => ({ ...prev, type: false }));
  };

  const handleClear = () => {
    setFormData((prev) => ({ ...prev, message: "" }));
  };

  const handleSubmit = async () => {
    const nextErrors = {
      name: formData.name.trim() === "",
      email: !isEmail(formData.email.trim()),
      type: formData.type === "",
      deadline: formData.deadline === "",
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      toast({
        title: "Missing or invalid fields",
        description: "Please complete all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);
      const payload = {
        recommender_name: formData.name.trim(),
        recommender_email: formData.email.trim(),
        recommender_type: formData.type,
        deadline: formData.deadline,
        message: formData.message || undefined,
      };
      const res = await sendRecommenderRequest(payload);

      if (res?.ok) {
        toast({
          title: "Request sent",
          description: res?.accepted?.length
            ? `Delivered to: ${res.accepted.join(", ")}`
            : "Submitted successfully.",
        });
        await loadRows();
        onComplete(); // keep your current flow (proceeds back to builder)
      } else {
        throw new Error(res?.message || "Failed to send request");
      }
    } catch (e: any) {
      toast({
        title: "Send failed",
        description: e?.message || "SMTP/Server error",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const doRemind = async (id: number) => {
    try {
      await remindRecommender(id);
      toast({ title: "Reminder sent" });
      loadRows();
    } catch (e: any) {
      toast({
        title: "Reminder failed",
        description: e?.message || "Server error",
        variant: "destructive",
      });
    }
  };

  const total = rows.length;
  const used = total; // if you have a limit from API, adjust here
  const left = Math.max(0, 3 - used); // example quota text (adjust/remove if not needed)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Ask someone else to recommend you
        </h2>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4 mb-6">
          <p className="text-amber-800 dark:text-amber-300 text-sm">
            <strong>Note:</strong> Recommender’s Name, Email, Type, and Deadline
            are required to send the request.
          </p>
        </div>

        <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-md p-4 mb-6">
          <p className="text-pink-800 dark:text-pink-300 text-sm">
            <strong>Quota:</strong> You can submit 3 recommendation requests.
            You have submitted {used}. You have {left} left.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="flex items-center">
            Recommender’s Name <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            className={errors.name ? "border-red-500" : ""}
            placeholder="Full name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">This field is required</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="flex items-center">
            Recommender’s Email <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? "border-red-500" : ""}
            placeholder="name@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              Enter a valid email address
            </p>
          )}
        </div>

        <div>
          <Label className="flex items-center">
            Type of Recommender <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select value={formData.type} onValueChange={handleTypeChange}>
            <SelectTrigger className={errors.type ? "border-red-500" : ""}>
              <SelectValue placeholder="Select recommender type" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">This field is required</p>
          )}
        </div>

        <div>
          <Label htmlFor="deadline" className="flex items-center">
            Deadline Date <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleInputChange}
            className={errors.deadline ? "border-red-500" : ""}
          />
          {errors.deadline && (
            <p className="text-red-500 text-sm mt-1">This field is required</p>
          )}
        </div>

        <div>
          <Label htmlFor="message" className="flex items-center mb-1">
            Template <span className="text-red-500 ml-1">*</span>
          </Label>

          <div className="border border-gray-200 dark:border-gray-700 rounded-md">
            <div className="flex items-center border-b border-gray-200 dark:border-gray-700 p-2 gap-2 overflow-x-auto">
              {/* dummy toolbar */}
              {["B", "I", "U", '"', "•", "↩", "↪", "🔗"].map((ch) => (
                <Button
                  key={ch}
                  variant="ghost"
                  size="sm"
                  className="w-7 h-7 p-0"
                >
                  {ch}
                </Button>
              ))}
            </div>
            <Textarea
              id="message"
              value={formData.message}
              onChange={handleInputChange}
              className="min-h-[200px] border-0 rounded-t-none focus-visible:ring-0 resize-y"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={sending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {sending ? "Sending..." : "Send Request"}
        </Button>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
        <h3 className="text-lg font-medium mb-4">Your Requests</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-4">Recommender</th>
                <th className="text-left py-2 px-4">Email</th>
                <th className="text-left py-2 px-4">Type</th>
                <th className="text-left py-2 px-4">Deadline</th>
                <th className="text-left py-2 px-4">Status</th>
                <th className="text-left py-2 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingList ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-sm text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-sm text-gray-500"
                  >
                    No requests yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const email = (r.recommender_email ||
                    r.email ||
                    "-") as string;
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="py-3 px-4">{r.teacher_name || "-"}</td>
                      <td className="py-3 px-4">{email}</td>
                      <td className="py-3 px-4">{r.recommender_type || "-"}</td>
                      <td className="py-3 px-4">{r.deadline || "-"}</td>
                      <td className="py-3 px-4">{r.recommend_status || "-"}</td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => doRemind(r.id)}
                        >
                          Remind
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecommenderRequestForm;
