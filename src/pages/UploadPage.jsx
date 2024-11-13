import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UploadPage() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [file, setFile] = useState(null);
  const [quarter, setQuarter] = useState("");
  const [isAddingNewCompany, setIsAddingNewCompany] = useState(false);

  useEffect(() => {
    // Fetch existing companies from the backend
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("http://localhost:5000/companies");
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  const handleCompanyChange = (e) => {
    const value = e.target.value;
    if (value === "new") {
      setIsAddingNewCompany(true);
      setSelectedCompany("");
    } else {
      setIsAddingNewCompany(false);
      setSelectedCompany(value);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || (!selectedCompany && !newCompanyName) || !quarter) {
      alert("Please fill out all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("quarter", quarter);

    if (isAddingNewCompany && newCompanyName) {
      formData.append("companyName", newCompanyName);
    } else {
      formData.append("companyName", selectedCompany);
    }

    try {
      await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("File uploaded and processed successfully.");
      // Reset the form
      setSelectedCompany("");
      setNewCompanyName("");
      setFile(null);
      setQuarter("");
      setIsAddingNewCompany(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-xl mt-20">
      <h2 className="text-2xl font-bold mb-6">Upload Vulnerability Data</h2>
      <form onSubmit={handleSubmit}>

        {/* Company Selection */}
        <label className="block text-gray-700 font-semibold mb-2">
          Select or Add Company
        </label>
        <select
          value={selectedCompany || (isAddingNewCompany ? "new" : "")}
          onChange={handleCompanyChange}
          className="p-2 border border-gray-300 rounded w-full mb-4"
        >
          <option value="" disabled>
            -- Select Company --
          </option>
          {companies.map((company) => (
            <option key={company.id} value={company.name}>
              {company.name}
            </option>
          ))}
          <option value="new">+ Add New Company</option>
        </select>

        {/* New Company Name Input */}
        {isAddingNewCompany && (
          <input
            type="text"
            placeholder="Enter new company name"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full mb-4"
          />
        )}

        {/* Quarter Input */}
        <label className="block text-gray-700 font-semibold mb-2">
          Quarter
        </label>
        <input
          type="text"
          placeholder="e.g., Q1"
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full mb-4"
        />

        {/* File Input */}
        <label className="block text-gray-700 font-semibold mb-2">
          Select CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="mb-4"
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Upload File
        </button>
      </form>
    </div>
  );
}
