import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import VulnerabilityModal from "../components/VulnerabilityModal.jsx";
import SummaryModal from "../components/SummaryModal.jsx";

export default function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [quarters, setQuarters] = useState([]);
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [tab, setTab] = useState("all");
  const [latestQuarter, setLatestQuarter] = useState("");
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchQuarters();
      fetchVulnerabilities();
    }
  }, [selectedCompany, page, search, selectedQuarter, tab]);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get("http://localhost:5000/companies");
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchQuarters = async () => {
    try {
      const response = await axios.get("http://localhost:5000/quarters", {
        params: { companyId: selectedCompany },
      });
      const quartersData = response.data;
      quartersData.sort(); // Ensure quarters are sorted
      setQuarters(quartersData);
      setLatestQuarter(quartersData[quartersData.length - 1]); // Set the latest quarter
    } catch (error) {
      console.error("Error fetching quarters:", error);
    }
  };

  const fetchVulnerabilities = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        search,
        companyId: selectedCompany,
      };

      if (tab === "carryForward") {
        params.isResolved = false;
        params.quarter = latestQuarter;
      } else if (tab === "quarter" && selectedQuarter) {
        params.quarter = selectedQuarter;
      }

      const response = await axios.get(
        "http://localhost:5000/vulnerabilities",
        { params },
      );

      let vulnerabilitiesData = response.data.data;

      if (tab === "carryForward") {
        vulnerabilitiesData = vulnerabilitiesData.filter(
          (vuln) => vuln.quarter.length > 1,
        );
      }

      setVulnerabilities(vulnerabilitiesData);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching vulnerabilities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleCompanySelect = (companyId) => {
    setSelectedCompany(companyId);
    setPage(1); // Reset to first page when company changes
    setTab("all"); // Reset tab
    setSelectedQuarter("");
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleQuarterSelect = (quarter) => {
    setTab("quarter");
    setSelectedQuarter(quarter);
    setPage(1);
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setPage(1);
    setSelectedQuarter("");
  };

  const handleVulnClick = (vuln) => {
    setSelectedVuln(vuln); // Set selected vulnerability for modal
  };

  const closeModal = () => {
    setSelectedVuln(null); // Close modal by setting selected vulnerability to null
  };

  return (
    <div className="min-h-screen py-6 px-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <div className="flex justify-between my-4 items-center">
        <h2 className="text-3xl font-bold">Vulnerabilities Dashboard</h2>

        {/* Company Selector */}
        <div className="flex gap-2">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => handleCompanySelect(company.id)}
              className={`px-3 rounded-full shadow-lg p-1 transition ${
                selectedCompany === company.id
                  ? "bg-white text-indigo-600"
                  : "bg-indigo-700 hover:bg-indigo-600"
              }`}
            >
              {company.name}
            </button>
          ))}
        </div>
        {/* Summary Button */}
        <button
          onClick={() => setIsSummaryOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mb-6"
        >
          View Summary
        </button>
      </div>
      <div className="flex justify-between px-2 my-4">
        {/* Search Input */}
        <div className="flex">
          <input
            type="text"
            placeholder="Search vulnerabilities..."
            value={search}
            onChange={handleSearchChange}
            className="w-full max-w-md px-4 py-2 rounded-full text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        {/* Quarter Tabs */}
        <div className="flex">
          <button
            onClick={() => handleTabChange("all")}
            className={`px-4 py-2 mr-2 rounded-lg ${
              tab === "all" ? "bg-indigo-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            All
          </button>
          {quarters.map((quarter) => (
            <button
              key={quarter}
              onClick={() => handleQuarterSelect(quarter)}
              className={`px-4 py-2 mr-2 rounded-lg ${
                selectedQuarter === quarter && tab === "quarter"
                  ? "bg-indigo-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {quarter}
            </button>
          ))}
          <button
            onClick={() => handleTabChange("carryForward")}
            className={`px-4 py-2 rounded-lg ${
              tab === "carryForward"
                ? "bg-indigo-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Carry Forward
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-lg">Loading vulnerabilities...</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
            <table className="min-w-full bg-white rounded-lg">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    Port
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    Protocol
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    CVE ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    Impact
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    Is Resolved
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                    Quarters
                  </th>
                </tr>
              </thead>
              <tbody>
                {vulnerabilities.map((vuln) => (
                  <tr
                    key={vuln.id}
                    onClick={() => handleVulnClick(vuln)}
                    className={`${
                      tab === "quarter" &&
                      vuln.quarter.includes(selectedQuarter) &&
                      vuln.quarter.length > 1
                        ? "bg-gray-300 text-gray-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <td className="px-6 py-4 border-b text-gray-700 max-w-xs truncate">
                      {vuln.title}
                    </td>
                    <td className="px-6 py-4 border-b text-gray-700">
                      {vuln.assetIp}
                    </td>
                    <td className="px-6 py-4 border-b text-gray-700">
                      {vuln.port}
                    </td>
                    <td className="px-6 py-4 border-b text-gray-700">
                      {vuln.riskLevel}
                    </td>
                    <td className="px-6 py-4 border-b text-gray-700 max-w-xs truncate">
                      {vuln.description}
                    </td>
                    <td className="px-6 py-4 border-b text-gray-700">
                      {vuln.protocol}
                    </td>
                    <td className="px-6 py-4 border-b text-gray-700 max-w-xs truncate">
                      {vuln.cveId.join(", ")}
                    </td>
                    <td className="px-6 py-4 border-b text-gray-700 max-w-xs truncate">
                      {vuln.impact}
                    </td>
                    <td className="px-6 py-4 border-b text-gray-700">
                      {vuln.company.name}
                    </td>
                    <td className="px-6 py-4 border-b text-gray-700">
                      {vuln.isResolved ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-4 border-b text-gray-700">
                      {vuln.quarter.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg disabled:opacity-50 transition-transform hover:scale-105"
            >
              <FaChevronLeft className="mr-2" />
              Previous
            </button>
            <span className="text-lg font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg disabled:opacity-50 transition-transform hover:scale-105"
            >
              Next
              <FaChevronRight className="ml-2" />
            </button>
          </div>
        </>
      )}
      {/* Vulnerability Modal */}
      {selectedVuln && (
        <VulnerabilityModal vulnerability={selectedVuln} onClose={closeModal} />
      )}
      {/* Summary Modal */}
      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        companyId={selectedCompany}
      />
    </div>
  );
}
