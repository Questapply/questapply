import { Button } from "@/components/ui/button";

export default function HelpCenterTicket() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Create Support Ticket
      </h2>

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input className="w-full p-3 border rounded-md bg-white dark:bg-gray-800" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input
              type="email"
              className="w-full p-3 border rounded-md bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Subject</label>
          <input className="w-full p-3 border rounded-md bg-white dark:bg-gray-800" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <select className="w-full p-3 border rounded-md bg-white dark:bg-gray-800">
            <option value="">Select category</option>
            <option value="technical">Technical Issue</option>
            <option value="billing">Billing</option>
            <option value="account">Account</option>
            <option value="application">Application</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            rows={5}
            className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Attachments (Optional)</label>
          <div className="border-2 border-dashed rounded-md p-6 text-center text-sm">
            Drag & drop or <span className="text-purple-600">browse</span>
          </div>
        </div>

        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          Submit Ticket
        </Button>
      </form>
    </div>
  );
}
