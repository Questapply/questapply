import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../layout/DashboardLayout";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Headphones,
  MessageSquare,
  Clock,
  CheckCircle2,
  Send,
  PlusCircle,
  Search,
  Paperclip,
  HelpCircle,
  Moon,
  Sun,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import NavigationButtons from "../layout/NavigationButtons";

const Support = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<number | null>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Initialize dark mode based on document class when component mounts
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Sample support tickets
  const tickets = [
    {
      id: 1,
      subject: "Help with application process",
      status: "open",
      created: "2023-11-18",
      updated: "2023-11-20",
      category: "Application",
      messages: [
        {
          id: 1,
          sender: "You",
          time: "2023-11-18T14:30:00",
          content:
            "Hello, I'm having trouble with uploading my transcript to the Stanford application. The system keeps saying the file is too large, but it's only 2MB. Could you please help me resolve this issue?",
          isAdmin: false,
        },
        {
          id: 2,
          sender: "Support Agent",
          time: "2023-11-18T15:45:00",
          content:
            "Hi there, thank you for reaching out. I'd be happy to help with your transcript upload issue. Stanford's system actually has a 1MB file size limit for transcripts. Please try compressing the PDF or resaving it with a lower quality setting to reduce the file size. Let me know if that works for you!",
          isAdmin: true,
        },
        {
          id: 3,
          sender: "You",
          time: "2023-11-19T09:20:00",
          content:
            "I tried compressing the file and now it's under 1MB, but I'm still getting an error. The message says 'Invalid file format'. I'm using a PDF file that worked for other universities.",
          isAdmin: false,
        },
        {
          id: 4,
          sender: "Support Agent",
          time: "2023-11-20T11:10:00",
          content:
            "I understand how frustrating this can be. Stanford specifically requires PDFs that are not password-protected and are text-searchable. Could you check if your PDF has any security settings enabled? Also, try saving it as a new PDF with Adobe Acrobat or a similar tool to ensure it meets their requirements.",
          isAdmin: true,
        },
      ],
    },
    {
      id: 2,
      subject: "Question about LOR submission",
      status: "closed",
      created: "2023-11-10",
      updated: "2023-11-15",
      category: "Documents",
      messages: [
        {
          id: 1,
          sender: "You",
          time: "2023-11-10T10:15:00",
          content:
            "I have a question about letter of recommendation submissions. My professor is asking how to submit the LOR directly. Where should I direct them?",
          isAdmin: false,
        },
        {
          id: 2,
          sender: "Support Agent",
          time: "2023-11-10T16:30:00",
          content:
            "Hello! Your professor should receive an automated email with submission instructions once you add them as a recommender in your application. The email contains a unique link for them to upload their recommendation letter. If they haven't received it, you can resend the invitation from your dashboard.",
          isAdmin: true,
        },
        {
          id: 3,
          sender: "You",
          time: "2023-11-11T09:45:00",
          content:
            "Thank you! I'll check my dashboard and make sure the email is correct. If they still don't receive it, should I contact you again or the university directly?",
          isAdmin: false,
        },
        {
          id: 4,
          sender: "Support Agent",
          time: "2023-11-15T14:20:00",
          content:
            "You're welcome! If after resending the invitation your professor still doesn't receive it, please contact us again with their correct email address, and we can troubleshoot further. If it's urgent and close to the deadline, you might also want to contact the university's graduate admissions office directly as a backup. Is there anything else I can help with?",
          isAdmin: true,
        },
        {
          id: 5,
          sender: "You",
          time: "2023-11-15T15:05:00",
          content: "No, that's all I needed. Thank you for your help!",
          isAdmin: false,
        },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Open
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Closed
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTicketData = tickets.find((ticket) => ticket.id === activeTicket);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      // In a real app, you would send the message to the server
      // For now, we'll just clear the input
      setNewMessage("");
      // Show a success message or update the UI
    }
  };

  return (
    <DashboardLayout
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      <NavigationButtons isDarkMode={isDarkMode} />
      <div className="space-y-8 mt-4 md:mt-7">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-2"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Support Tickets
            </h1>
            <div className="flex items-center space-x-4">
              {/* Theme toggle switch */}
              {/* <div className="flex items-center space-x-2">
                <Sun
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-gray-400" : "text-yellow-500"
                  }`}
                />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Moon
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-blue-400" : "text-gray-400"
                  }`}
                />
              </div> */}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Get help with any issues or questions regarding your applications.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tickets List (Left Side) */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>My Tickets</CardTitle>
                  <Button className="flex items-center gap-1" size="sm">
                    <PlusCircle className="h-4 w-4" />
                    New Ticket
                  </Button>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search tickets..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredTickets.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No tickets found
                  </div>
                ) : (
                  filteredTickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          activeTicket === ticket.id
                            ? "bg-purple-100 dark:bg-purple-900/30 border-l-4 border-purple-500"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setActiveTicket(ticket.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="font-medium">{ticket.subject}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(ticket.updated).toLocaleDateString()}
                            </p>
                          </div>
                          <div>{getStatusBadge(ticket.status)}</div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                            {ticket.category}
                          </span>
                          <span>{ticket.messages.length} messages</span>
                        </div>
                      </div>
                      {index < filteredTickets.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Help Center</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all">
                  <HelpCircle className="h-5 w-5 text-purple-500" />
                  <div>
                    <h4 className="font-medium">FAQ</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Find answers to common questions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  <div>
                    <h4 className="font-medium">Live Chat</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Chat with a support agent
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Details (Right Side) */}
          <div className="lg:col-span-2">
            <Card>
              {activeTicketData ? (
                <>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{activeTicketData.subject}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Ticket #{activeTicketData.id} •{" "}
                          {activeTicketData.category} •{" "}
                          {new Date(
                            activeTicketData.created
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>{getStatusBadge(activeTicketData.status)}</div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <div className="p-6 max-h-[400px] overflow-y-auto space-y-6">
                      {activeTicketData.messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex ${
                            message.isAdmin ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] ${
                              message.isAdmin
                                ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                : "bg-purple-100 dark:bg-purple-900/30"
                            } rounded-lg p-4`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-sm">
                                {message.sender}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(message.time).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {activeTicketData.status === "open" && (
                      <div className="p-6 border-t">
                        <Textarea
                          placeholder="Type your message here..."
                          className="mb-4"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <div className="flex justify-between items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Paperclip className="h-4 w-4" />
                            Attach Files
                          </Button>
                          <div className="space-x-2">
                            <Button variant="outline" size="sm">
                              Close Ticket
                            </Button>
                            <Button
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={handleSendMessage}
                            >
                              <Send className="h-4 w-4" />
                              Send Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Headphones className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No ticket selected
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">
                    Select a ticket from the list on the left or create a new
                    support ticket.
                  </p>
                  <Button className="mt-6 flex items-center gap-1">
                    <PlusCircle className="h-4 w-4" />
                    Create New Ticket
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Support;
