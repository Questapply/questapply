import React from "react";
import { motion } from "framer-motion";
import { Phone, Mail, Globe, MapPin } from "lucide-react";
import type { ProgramDetail } from "../../data/programDetails";

interface ContactInfoProps {
  program: ProgramDetail;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ program }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <Phone className="h-5 w-5 text-purple-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Contact Information
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-lg border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center mb-4">
              <Phone className="h-5 w-5 text-purple-500 mr-3" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Telephone
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {program.contact.tel}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-purple-500 mr-3" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Email
                </div>
                <a
                  href={`mailto:${program.contact.email}`}
                  className="font-medium text-purple-600 dark:text-purple-400 hover:underline"
                >
                  {program.contact.email}
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-lg border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center mb-4">
              <Globe className="h-5 w-5 text-purple-500 mr-3" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Website
                </div>
                <a
                  href={program.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-purple-600 dark:text-purple-400 hover:underline truncate block max-w-full"
                >
                  {program.contact.website.replace(/https?:\/\//, "")}
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-purple-500 mr-3" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Address
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {program.contact.address}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
