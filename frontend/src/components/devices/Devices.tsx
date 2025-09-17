import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Laptop,
  Smartphone,
  Tablet,
  CheckCircle2,
  Clock,
  MapPin,
  Info,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { useToast } from "../../hooks/use-toast";

interface Device {
  id: string;
  name: string;
  type: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

const mockDevices: Device[] = [
  {
    id: "device-1",
    name: "MacBook Pro",
    type: "desktop",
    browser: "Chrome 124.0.0.0",
    os: "macOS Sonoma 14.4",
    location: "San Francisco, CA, USA",
    ip: "192.168.1.101",
    lastActive: "Now",
    isCurrent: true,
  },
  {
    id: "device-2",
    name: "iPhone 15",
    type: "mobile",
    browser: "Safari 17.4",
    os: "iOS 17.4",
    location: "San Francisco, CA, USA",
    ip: "192.168.1.102",
    lastActive: "2 hours ago",
    isCurrent: false,
  },
  {
    id: "device-3",
    name: "iPad Pro",
    type: "tablet",
    browser: "Safari 17.4",
    os: "iPadOS 17.4",
    location: "New York, NY, USA",
    ip: "192.168.1.103",
    lastActive: "Yesterday at 8:45 PM",
    isCurrent: false,
  },
];

const Devices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>(mockDevices);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "desktop":
        return (
          <Laptop className="h-7 w-7 text-purple-500 dark:text-purple-400" />
        );
      case "mobile":
        return (
          <Smartphone className="h-7 w-7 text-purple-500 dark:text-purple-400" />
        );
      case "tablet":
        return (
          <Tablet className="h-7 w-7 text-purple-500 dark:text-purple-400" />
        );
      default:
        return (
          <Laptop className="h-7 w-7 text-purple-500 dark:text-purple-400" />
        );
    }
  };

  const handleLogoutDevice = (deviceId: string) => {
    // Filter out the device with the given ID
    setDevices(devices.filter((device) => device.id !== deviceId));

    toast({
      title: "Device logged out",
      description: "The device has been successfully logged out",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <Button
          variant="ghost"
          className="mb-6 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Devices
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
            View and manage all devices currently logged into your QuestApply
            account. For security, you can log out of any unrecognized devices.
          </p>
        </header>

        <div className="space-y-6">
          {devices.map((device) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {getDeviceIcon(device.type)}
                      <div className="ml-4">
                        <CardTitle className="text-xl font-semibold flex items-center">
                          {device.name}
                          {device.isCurrent && (
                            <span className="ml-3 text-xs font-medium text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 rounded-full px-2.5 py-0.5 flex items-center">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Current Device
                            </span>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {device.browser} • {device.os}
                        </p>
                      </div>
                    </div>

                    {!device.isCurrent && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleLogoutDevice(device.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <p className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Last active:</span>{" "}
                        {device.lastActive}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <p className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Location:</span>{" "}
                        {device.location}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Info className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <p className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">IP Address:</span>{" "}
                        {device.ip}
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 pt-4 pb-4">
                  {device.isCurrent ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This is your current device. If you log out from here,
                      you'll need to log back in.
                    </p>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Don't recognize this device? Log it out immediately for
                        security.
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleLogoutDevice(device.id)}
                      >
                        Log out device
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Devices;
