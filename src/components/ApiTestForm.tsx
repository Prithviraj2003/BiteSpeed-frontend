import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, CheckCircle, XCircle } from "lucide-react";
import { IdentifyRequest, IdentifyResponse, ApiTestResult } from "../types";
import ApiService from "../services/api";

interface ApiTestFormProps {
  onResult: (result: ApiTestResult) => void;
}

const ApiTestForm: React.FC<ApiTestFormProps> = ({ onResult }) => {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ApiTestResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email && !phoneNumber) {
      alert(
        "Please provide at least one contact method (email or phone number)"
      );
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    const request: IdentifyRequest = {
      ...(email && { email }),
      ...(phoneNumber && { phoneNumber }),
    };

    try {
      const data = await ApiService.identify(request);
      const result: ApiTestResult = {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        request,
        duration: Date.now() - startTime,
      };

      setLastResult(result);
      onResult(result);
    } catch (error: any) {
      const result: ApiTestResult = {
        success: false,
        error:
          error.response?.data?.message || error.message || "Unknown error",
        timestamp: new Date().toISOString(),
        request,
        duration: Date.now() - startTime,
      };

      setLastResult(result);
      onResult(result);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setPhoneNumber("");
    setLastResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-lg border border-dark-600 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">API Test</h2>
        {lastResult && (
          <div className="flex items-center space-x-2">
            {lastResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm text-dark-300">
              {lastResult.duration}ms
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-dark-200 mb-2"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-bitespeed-500 focus:border-bitespeed-500"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-dark-200 mb-2"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-bitespeed-500 focus:border-bitespeed-500"
            placeholder="+1234567890"
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isLoading || (!email && !phoneNumber)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-bitespeed-600 hover:bg-bitespeed-700 disabled:bg-dark-600 disabled:cursor-not-allowed text-white rounded-md transition-colors duration-200"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isLoading ? "Identifying..." : "Identify Contact"}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-dark-600 hover:bg-dark-500 text-white rounded-md transition-colors duration-200"
          >
            Reset
          </button>
        </div>
      </form>

      {lastResult && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-6 p-4 bg-dark-900 rounded-lg border border-dark-700"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-white">Result</h3>
            <span
              className={`text-sm px-2 py-1 rounded ${
                lastResult.success
                  ? "bg-green-900 text-green-300"
                  : "bg-red-900 text-red-300"
              }`}
            >
              {lastResult.success ? "Success" : "Error"}
            </span>
          </div>

          {lastResult.success && lastResult.data ? (
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-dark-300">
                  Primary Contact ID:
                </span>
                <span className="ml-2 text-sm text-bitespeed-400 font-mono">
                  {lastResult.data.contact.primaryContactId}
                </span>
              </div>

              <div>
                <span className="text-sm font-medium text-dark-300">
                  Emails:
                </span>
                <div className="ml-2 space-y-1">
                  {lastResult.data.contact.emails.map((email, index) => (
                    <div key={index} className="text-sm text-dark-100">
                      • {email}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-dark-300">
                  Phone Numbers:
                </span>
                <div className="ml-2 space-y-1">
                  {lastResult.data.contact.phoneNumbers.map((phone, index) => (
                    <div key={index} className="text-sm text-dark-100">
                      • {phone}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-dark-300">
                  Secondary Contact IDs:
                </span>
                <div className="ml-2 space-y-1">
                  {lastResult.data.contact.secondaryContactIds.map(
                    (id, index) => (
                      <div
                        key={index}
                        className="text-sm text-dark-100 font-mono"
                      >
                        • {id}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-400">{lastResult.error}</div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ApiTestForm;
