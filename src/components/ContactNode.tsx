import React from "react";
import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Crown } from "lucide-react";
import { Contact } from "../types";

interface ContactNodeProps {
  data: {
    contact: Contact;
    isPrimary: boolean;
    emails: string[];
    phoneNumbers: string[];
    secondaryCount: number;
  };
  selected?: boolean;
}

const ContactNode: React.FC<ContactNodeProps> = ({ data, selected }) => {
  const { contact, isPrimary, emails, phoneNumbers, secondaryCount } = data;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        relative p-4 rounded-lg border-2 bg-gradient-to-br min-w-[280px] max-w-[320px]
        ${
          isPrimary
            ? "from-bitespeed-800 to-bitespeed-900 border-bitespeed-500 shadow-lg shadow-bitespeed-500/20"
            : "from-dark-700 to-dark-800 border-dark-500"
        }
        ${selected ? "ring-2 ring-bitespeed-400 ring-opacity-50" : ""}
        transition-all duration-200 hover:shadow-xl
      `}
    >
      {/* Primary/Secondary Indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isPrimary ? (
            <Crown className="w-5 h-5 text-yellow-400" />
          ) : (
            <User className="w-5 h-5 text-dark-400" />
          )}
          <span
            className={`text-sm font-semibold ${
              isPrimary ? "text-yellow-400" : "text-dark-400"
            }`}
          >
            {isPrimary ? "Primary" : "Secondary"}
          </span>
          {isPrimary && (emails.length > 1 || phoneNumbers.length > 1) && (
            <span className="text-xs bg-bitespeed-600 text-bitespeed-200 px-2 py-1 rounded-full">
              Consolidated
            </span>
          )}
        </div>
        <div className="text-xs text-dark-400">ID: {contact.id.slice(-8)}</div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3">
        {/* Emails */}
        {emails.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-bitespeed-400" />
              <span className="text-sm font-medium text-dark-200">Emails</span>
              {isPrimary && emails.length > 1 && (
                <span className="text-xs text-dark-400 bg-dark-600 px-2 py-1 rounded">
                  {emails.length} consolidated
                </span>
              )}
            </div>
            {emails.map((email, index) => (
              <div
                key={index}
                className={`text-xs ml-6 truncate ${
                  index === 0 && isPrimary
                    ? "text-bitespeed-300 font-medium"
                    : "text-dark-300"
                }`}
              >
                {email}
                {index === 0 && isPrimary && emails.length > 1 && (
                  <span className="ml-2 text-xs text-bitespeed-400">
                    (Primary)
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Phone Numbers */}
        {phoneNumbers.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-dark-200">
                Phone Numbers
              </span>
              {isPrimary && phoneNumbers.length > 1 && (
                <span className="text-xs text-dark-400 bg-dark-600 px-2 py-1 rounded">
                  {phoneNumbers.length} consolidated
                </span>
              )}
            </div>
            {phoneNumbers.map((phone, index) => (
              <div
                key={index}
                className={`text-xs ml-6 ${
                  index === 0 && isPrimary
                    ? "text-green-300 font-medium"
                    : "text-dark-300"
                }`}
              >
                {phone}
                {index === 0 && isPrimary && phoneNumbers.length > 1 && (
                  <span className="ml-2 text-xs text-green-400">(Primary)</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Secondary Count for Primary Contacts */}
        {isPrimary && secondaryCount > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-dark-600">
            <span className="text-xs text-dark-400">Secondary Contacts</span>
            <span className="text-sm font-semibold text-bitespeed-400">
              {secondaryCount}
            </span>
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-dark-500 pt-2 border-t border-dark-700">
          <div>Created: {new Date(contact.createdAt).toLocaleString()}</div>
          {contact.updatedAt !== contact.createdAt && (
            <div>Updated: {new Date(contact.updatedAt).toLocaleString()}</div>
          )}
        </div>
      </div>

      {/* Connection Handles */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-bitespeed-500 border-2 border-bitespeed-300"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-bitespeed-500 border-2 border-bitespeed-300"
      />

      {/* Pulse Animation for New Contacts */}
      {Date.now() - new Date(contact.createdAt).getTime() < 5000 && (
        <div className="absolute inset-0 rounded-lg bg-bitespeed-500 opacity-20 animate-pulse-ring" />
      )}
    </motion.div>
  );
};

export default ContactNode;
