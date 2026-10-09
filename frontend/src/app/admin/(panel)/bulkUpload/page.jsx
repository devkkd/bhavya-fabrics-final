"use client";

import { useState } from "react";
import BulkUploadPanel from "@/components/BulkUploadPanel";
import { Download, BookOpen } from "lucide-react";

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/$/, "");

export default function BulkUploadPage() {
  const [showGuide, setShowGuide] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);

  const downloadTemplate = async (type) => {
    try {
      const response = await fetch(
        `${API_URL}/bulk-upload/template/${type}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type === "raw" ? "rawMaterials" : "readyMade"}_template.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download template");
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
      {/* Header Section */}
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#1a1a1a",
              margin: "0 0 8px 0",
              fontFamily: "Georgia, serif",
            }}
          >
            Bulk Product Upload
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#666666",
              margin: "0",
              lineHeight: "1.5",
            }}
          >
            Import multiple products at once with automatic image matching and real-time validation
          </p>
        </div>
        <button
          onClick={() => setShowGuide(true)}
          onMouseEnter={() => setHoveredButton("guide")}
          onMouseLeave={() => setHoveredButton(null)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "8px",
            border: "1.5px solid #D9D0C5",
            background: hoveredButton === "guide" ? "#F5F2ED" : "#FFFFFF",
            color: "#295C65",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
          }}
        >
          <BookOpen size={18} />
          View Guide
        </button>
      </div>

      {/* Download Template Section */}
      <div
        style={{
          marginBottom: "32px",
          padding: "24px",
          borderRadius: "12px",
          background: "#FFF9F3",
          border: "1.5px solid #E8DCC8",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#295C65",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Download size={20} />
          Download Template
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Raw Materials Card */}
          <div
            style={{
              padding: "20px",
              borderRadius: "10px",
              background: "#FFFFFF",
              border: "1.5px solid #E3DCD4",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
              e.currentTarget.style.borderColor = "#D9D0C5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
              e.currentTarget.style.borderColor = "#E3DCD4";
            }}
          >
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#1a1a1a",
                  marginBottom: "4px",
                }}
              >
                Raw Materials
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#666666",
                  lineHeight: "1.4",
                }}
              >
                For meter-based products with minimum and maximum meter configuration
              </div>
            </div>
            <button
              onClick={() => downloadTemplate("raw")}
              onMouseEnter={() => setHoveredButton("raw")}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "none",
                background: hoveredButton === "raw" ? "#1F4A51" : "#295C65",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
            >
              <Download size={16} />
              Download Template
            </button>
          </div>

          {/* Ready-Made Card */}
          <div
            style={{
              padding: "20px",
              borderRadius: "10px",
              background: "#FFFFFF",
              border: "1.5px solid #E3DCD4",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
              e.currentTarget.style.borderColor = "#D9D0C5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
              e.currentTarget.style.borderColor = "#E3DCD4";
            }}
          >
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#1a1a1a",
                  marginBottom: "4px",
                }}
              >
                Ready-Made Products
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#666666",
                  lineHeight: "1.4",
                }}
              >
                For piece-based products with colors, sizes, and inventory variants
              </div>
            </div>
            <button
              onClick={() => downloadTemplate("readyMade")}
              onMouseEnter={() => setHoveredButton("readyMade")}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "none",
                background: hoveredButton === "readyMade" ? "#1F4A51" : "#295C65",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
            >
              <Download size={16} />
              Download Template
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Upload Component */}
      <div style={{ marginBottom: "24px" }}>
        <BulkUploadPanel />
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowGuide(false)}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "14px",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "32px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                paddingBottom: "16px",
                borderBottom: "1.5px solid #E3DCD4",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#1a1a1a",
                  margin: "0",
                  fontFamily: "Georgia, serif",
                }}
              >
                Bulk Upload Guide
              </h2>
              <button
                onClick={() => setShowGuide(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  border: "none",
                  background: "#F5F2ED",
                  borderRadius: "8px",
                  color: "#295C65",
                  fontSize: "24px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#EBE4DB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F5F2ED";
                }}
              >
                ×
              </button>
            </div>

            <div style={{ fontSize: "14px", color: "#555555", lineHeight: "1.8" }}>
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#295C65", marginBottom: "10px" }}>
                  📋 Quick Start
                </h3>
                <ol style={{ margin: "0", paddingLeft: "20px" }}>
                  <li style={{ marginBottom: "8px" }}>Download the appropriate template (Raw Materials or Ready-Made)</li>
                  <li style={{ marginBottom: "8px" }}>Fill in your product data in Excel</li>
                  <li style={{ marginBottom: "8px" }}>Organize images with SKU naming (SKU_1.jpg, SKU_1.1.jpg, etc.)</li>
                  <li style={{ marginBottom: "8px" }}>Drag Excel file and image folder into the upload area</li>
                  <li style={{ marginBottom: "8px" }}>Click "Validate & Preview" to check for errors</li>
                  <li style={{ marginBottom: "8px" }}>Click "Import Products" to complete the upload</li>
                </ol>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#295C65", marginBottom: "10px" }}>
                  🖼️ Image Naming
                </h3>
                <p style={{ margin: "0 0 12px 0" }}>Images should follow SKU-based naming patterns:</p>
                <ul style={{ margin: "0", paddingLeft: "20px" }}>
                  <li style={{ marginBottom: "6px" }}>
                    <code style={{ background: "#F5F2ED", padding: "2px 6px", borderRadius: "4px" }}>SKU_1.jpg</code> - Primary image
                  </li>
                  <li style={{ marginBottom: "6px" }}>
                    <code style={{ background: "#F5F2ED", padding: "2px 6px", borderRadius: "4px" }}>SKU_1.1.jpg</code> - Secondary image 1
                  </li>
                  <li style={{ marginBottom: "6px" }}>
                    <code style={{ background: "#F5F2ED", padding: "2px 6px", borderRadius: "4px" }}>SKU_1.2.jpg</code> - Secondary image 2
                  </li>
                </ul>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#295C65", marginBottom: "10px" }}>
                  ✓ Required Fields
                </h3>
                <ul style={{ margin: "0", paddingLeft: "20px" }}>
                  <li style={{ marginBottom: "6px" }}>SKU (unique identifier)</li>
                  <li style={{ marginBottom: "6px" }}>Product Name</li>
                  <li style={{ marginBottom: "6px" }}>Category</li>
                  <li style={{ marginBottom: "6px" }}>Sub Category</li>
                  <li style={{ marginBottom: "6px" }}>Description</li>
                  <li style={{ marginBottom: "6px" }}>Regular Price</li>
                </ul>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#295C65", marginBottom: "10px" }}>
                  ⚠️ Common Issues
                </h3>
                <ul style={{ margin: "0", paddingLeft: "20px" }}>
                  <li style={{ marginBottom: "6px" }}>
                    <strong>Duplicate SKU:</strong> Change to a unique SKU
                  </li>
                  <li style={{ marginBottom: "6px" }}>
                    <strong>Category not found:</strong> Check spelling and exact match
                  </li>
                  <li style={{ marginBottom: "6px" }}>
                    <strong>Invalid price:</strong> Enter numbers only (e.g., 1500.00)
                  </li>
                  <li style={{ marginBottom: "6px" }}>
                    <strong>No images found:</strong> Rename images with SKU in filename
                  </li>
                </ul>
              </div>

              <div style={{ marginBottom: "0" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#295C65", marginBottom: "10px" }}>
                  💡 Pro Tips
                </h3>
                <ul style={{ margin: "0", paddingLeft: "20px" }}>
                  <li style={{ marginBottom: "6px" }}>Start with 5-10 products to test your setup</li>
                  <li style={{ marginBottom: "6px" }}>Use consistent SKU naming (e.g., FABRIC_001)</li>
                  <li style={{ marginBottom: "6px" }}>Put all images in one folder for easier management</li>
                  <li style={{ marginBottom: "6px" }}>Use "draft" status while testing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
