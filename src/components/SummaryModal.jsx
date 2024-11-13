import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTimes } from "react-icons/fa";

export default function SummaryModal({ isOpen, onClose, companyId }) {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchSummaryData();
    }
  }, [isOpen]);

  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      // Fetch all vulnerabilities for the selected company
      const response = await axios.get("http://localhost:5000/vulnerabilities", {
        params: { companyId, page: 1, limit: 10000 }, // High limit to fetch all
      });

      const allVulnerabilities = response.data.data;

      // Summary calculations
      const riskCountData = { Critical: 0, High: 0, Medium: 0, Low: 0 };
      const resolveCountData = { Resolved: 0, Unresolved: 0 };
      const ipCountData = {};
      const portCountData = {};

      allVulnerabilities.forEach((vuln) => {
        riskCountData[vuln.riskLevel] = (riskCountData[vuln.riskLevel] || 0) + 1;
        resolveCountData[vuln.isResolved ? "Resolved" : "Unresolved"] += 1;

        // Count vulnerabilities per IP
        ipCountData[vuln.assetIp] = (ipCountData[vuln.assetIp] || 0) + 1;
        portCountData[vuln.port] = (portCountData[vuln.port] || 0) + 1;
      });

      setSummaryData({
        totalVulns: allVulnerabilities.length,
        riskCounts: riskCountData,
        resolveCounts: resolveCountData,
        ipCounts: ipCountData,
        portCounts: portCountData,
      });
    } catch (error) {
      console.error("Error fetching summary data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-white">
      Loading summary...
    </div>
  );

  const { totalVulns, riskCounts, resolveCounts, ipCounts, portCounts } = summaryData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-5">
      <div className="bg-white rounded-lg p-6 w-full relative overflow-y-auto max-h-screen text-black">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          <FaTimes size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Vulnerability Summary</h2>

        <p>Total Vulnerabilities: {totalVulns}</p>
        <p>Critical: {riskCounts.Critical}, High: {riskCounts.High}, Medium: {riskCounts.Medium}, Low: {riskCounts.Low}</p>
        <p>Resolved: {resolveCounts.Resolved}, Unresolved: {resolveCounts.Unresolved}</p>

        <h3 className="text-xl font-semibold mt-4">IP Vulnerability Count:</h3>
        <ul>
          {Object.entries(ipCounts).map(([ip, count]) => (
            <li key={ip}>{ip}: {count}</li>
          ))}
        </ul>

        <h3 className="text-xl font-semibold mt-4">Port Vulnerability Count:</h3>
        <ul>
          {Object.entries(portCounts).map(([port, count]) => (
            <li key={port}>Port {port}: {count}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
