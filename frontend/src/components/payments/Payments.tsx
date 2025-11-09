import React, { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../layout/DashboardLayout";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  CreditCard,
  Download,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Search,
  Filter,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import NavigationButtons from "../layout/NavigationButtons";

const Payments = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Sample payment methods
  const paymentMethods = [
    {
      id: 1,
      type: "credit_card",
      name: "Visa ending in 4242",
      expiry: "05/25",
      isDefault: true,
    },
    {
      id: 2,
      type: "credit_card",
      name: "Mastercard ending in 5678",
      expiry: "09/24",
      isDefault: false,
    },
  ];

  // Sample transactions
  const transactions = [
    {
      id: 1,
      date: "2023-11-20",
      description: "Premium Membership - Monthly",
      amount: 19.99,
      status: "completed",
      type: "subscription",
    },
    {
      id: 2,
      date: "2023-11-15",
      description: "Application Fee - Stanford University",
      amount: 125.0,
      status: "completed",
      type: "application",
    },
    {
      id: 3,
      date: "2023-11-05",
      description: "Document Review Service",
      amount: 49.99,
      status: "completed",
      type: "service",
    },
    {
      id: 4,
      date: "2023-10-20",
      description: "Premium Membership - Monthly",
      amount: 19.99,
      status: "completed",
      type: "subscription",
    },
    {
      id: 5,
      date: "2023-10-12",
      description: "Application Fee - MIT",
      amount: 75.0,
      status: "refunded",
      type: "application",
    },
    {
      id: 6,
      date: "2023-10-03",
      description: "Mock Interview Session",
      amount: 59.99,
      status: "pending",
      type: "service",
    },
  ];

  const subscriptions = [
    {
      id: 1,
      name: "Premium Membership",
      price: 19.99,
      billing: "monthly",
      nextBilling: "2023-12-20",
      status: "active",
    },
  ];

  const invoices = [
    {
      id: "INV-2023-001",
      date: "2023-11-20",
      amount: 19.99,
      status: "paid",
      items: ["Premium Membership - November 2023"],
    },
    {
      id: "INV-2023-002",
      date: "2023-11-15",
      amount: 125.0,
      status: "paid",
      items: ["Application Fee - Stanford University"],
    },
    {
      id: "INV-2023-003",
      date: "2023-11-05",
      amount: 49.99,
      status: "paid",
      items: ["Document Review Service"],
    },
    {
      id: "INV-2023-004",
      date: "2023-10-20",
      amount: 19.99,
      status: "paid",
      items: ["Premium Membership - October 2023"],
    },
  ];

  // Filter transactions based on search
  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {status === "active"
              ? "Active"
              : status === "paid"
              ? "Paid"
              : "Completed"}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "refunded":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" />
            Refunded
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return null;
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            My Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your payment methods, subscriptions, and view transaction
            history.
          </p>
        </motion.div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>Transaction History</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search transactions..."
                        className="pl-10 w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filter</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <div className="grid grid-cols-5 bg-gray-50 dark:bg-gray-800 p-4">
                    <div className="col-span-2 font-medium text-sm">
                      Description
                    </div>
                    <div className="font-medium text-sm">Date</div>
                    <div className="font-medium text-sm">Amount</div>
                    <div className="font-medium text-sm text-right">Status</div>
                  </div>

                  <div className="divide-y">
                    {filteredTransactions.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No transactions found
                      </div>
                    ) : (
                      filteredTransactions.map((transaction, index) => (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="grid grid-cols-5 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <div className="col-span-2">
                            <div>{transaction.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {transaction.type}
                            </div>
                          </div>
                          <div className="text-gray-600 dark:text-gray-300">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                          <div
                            className={
                              transaction.status === "refunded"
                                ? "text-blue-600 dark:text-blue-400"
                                : ""
                            }
                          >
                            ${transaction.amount.toFixed(2)}
                          </div>
                          <div className="text-right">
                            {getStatusBadge(transaction.status)}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment-methods">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {paymentMethods.map((method, index) => (
                    <motion.div
                      key={method.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <CreditCard className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold">{method.name}</h3>
                            {method.isDefault && (
                              <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Expires {method.expiry}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        {!method.isDefault && (
                          <Button variant="outline" size="sm">
                            Make Default
                          </Button>
                        )}
                        {!method.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button className="flex items-center gap-2 w-full justify-center py-6 border-dashed">
                  <Plus className="h-5 w-5" />
                  Add New Payment Method
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Your Subscriptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {subscriptions.length === 0 ? (
                  <div className="text-center p-8">
                    <h3 className="text-lg font-medium mb-2">
                      No active subscriptions
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      You don't have any active subscriptions at the moment.
                    </p>
                    <Button>View Plans</Button>
                  </div>
                ) : (
                  subscriptions.map((subscription, index) => (
                    <motion.div
                      key={subscription.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-6"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold">
                              {subscription.name}
                            </h3>
                            {getStatusBadge(subscription.status)}
                          </div>
                          <p className="text-2xl font-bold mt-2">
                            ${subscription.price.toFixed(2)}
                            <span className="text-sm font-normal text-gray-600 dark:text-gray-300">
                              /{subscription.billing}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                            Next billing date:{" "}
                            {new Date(
                              subscription.nextBilling
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Button>Manage</Button>
                          <Button variant="outline" className="w-full">
                            Cancel
                          </Button>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <div className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                          What's included:
                        </div>
                        <ul className="space-y-1 list-disc pl-4">
                          <li>Unlimited application tracking</li>
                          <li>Premium document templates</li>
                          <li>Priority support</li>
                          <li>AI-powered application assistance</li>
                          <li>Professor recommendation tools</li>
                        </ul>
                      </div>
                    </motion.div>
                  ))
                )}

                {subscriptions.length > 0 && (
                  <div className="text-center">
                    <Button variant="outline">View Available Plans</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <div className="grid grid-cols-5 bg-gray-50 dark:bg-gray-800 p-4">
                    <div className="font-medium text-sm">Invoice ID</div>
                    <div className="col-span-2 font-medium text-sm">Items</div>
                    <div className="font-medium text-sm">Date</div>
                    <div className="font-medium text-sm text-right">
                      Actions
                    </div>
                  </div>

                  <div className="divide-y">
                    {invoices.map((invoice, index) => (
                      <motion.div
                        key={invoice.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="grid grid-cols-5 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <div>
                          <div className="font-medium">{invoice.id}</div>
                          <div className="text-sm text-gray-500">
                            ${invoice.amount.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <ul className="space-y-1">
                            {invoice.items.map((item, idx) => (
                              <li key={idx} className="text-sm">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">
                          {new Date(invoice.date).toLocaleDateString()}
                        </div>
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Download className="h-4 w-4" />
                            PDF
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
