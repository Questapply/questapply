export const statuses = [
  { value: "considered", label: "Considered", color: "bg-gray-500" },

  { value: "applying", label: "Applying", color: "bg-yellow-500" },
  { value: "applied", label: "Applied", color: "bg-green-500" },
  { value: "waitlisted", label: "Waitlisted", color: "bg-orange-500" },
  { value: "accepted", label: "Accepted", color: "bg-emerald-500" },
  { value: "denied", label: "Denied", color: "bg-red-500" },
  { value: "enrolled", label: "Enrolled", color: "bg-blue-600" },
] as const;
export type StatusValue = (typeof statuses)[number]["value"];
export type AppStatus = (typeof statuses)[number]["value"];
