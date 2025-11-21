import React, { useState } from "react";

function MyForm() {
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    section: "",
    devices: "",
    action: "",
    itStaff: "",
    noITStaff: false,
    reason: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted:", formData);
    alert("Form submitted successfully!");
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Checkout & Return Form</h1>
      <p style={{ textAlign: "center", fontStyle: "italic" }}>(iPads & Chromebooks)</p>

      <form onSubmit={handleSubmit}>
        <label>Date & Time:</label>
        <input type="datetime-local" name="datetime" onChange={handleChange} required />

        <label>Name:</label>
        <select name="name" value={formData.name} onChange={handleChange} required>
          <option value="">Select Name</option>
          <option value="Gerardo Tobar">Gerardo Tobar</option>
          <option value="Other">Other</option>
        </select>

        <label>Grade:</label>
        <select name="grade" value={formData.grade} onChange={handleChange} required>
          <option value="">Select Grade</option>
          <option value="PK">PK</option>
          <option value="K">K</option>
          <option value="1">1</option>
          <option value="2">2</option>
          {/* Add more grades as needed */}
        </select>

        <label>Section:</label>
        <select name="section" value={formData.section} onChange={handleChange} required>
          <option value="">Select Section</option>
          <option value="A">A</option>
          <option value="B">B</option>
          {/* Add more sections as needed */}
        </select>

        <label># of Devices:</label>
        <input type="number" name="devices" value={formData.devices} onChange={handleChange} required />

        <div>
          <label>
            <input
              type="radio"
              name="action"
              value="checkout"
              checked={formData.action === "checkout"}
              onChange={handleChange}
            />
            Check Out
          </label>
          <label>
            <input
              type="radio"
              name="action"
              value="return"
              checked={formData.action === "return"}
              onChange={handleChange}
            />
            Return
          </label>
        </div>

        <label>User's Signature:</label>
        <div style={{ border: "1px solid #ccc", height: 50, marginBottom: 10 }}>[Signature box]</div>

        <label>IT Staff's Signature:</label>
        <div style={{ border: "1px solid #ccc", height: 50, marginBottom: 10 }}>[Signature box]</div>

        <label>IT Staff:</label>
        <select name="itStaff" value={formData.itStaff} onChange={handleChange}>
          <option value="">Select IT Staff</option>
          <option value="Gerardo Tobar">Gerardo Tobar</option>
          <option value="Other">Other</option>
        </select>

        <label>
          <input
            type="checkbox"
            name="noITStaff"
            checked={formData
