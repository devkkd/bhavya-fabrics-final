"use client";

import { MessageSquareText, Mail, PhoneCall, Clock3 } from "lucide-react";

const summary = [
  {
    title: "All Enquiries",
    value: "0",
    text: "Customer queries",
    icon: MessageSquareText
  },
  {
    title: "New",
    value: "0",
    text: "Unread messages",
    icon: Mail
  },
  {
    title: "Follow Up",
    value: "0",
    text: "Need response",
    icon: PhoneCall
  },
  {
    title: "Pending",
    value: "0",
    text: "Awaiting action",
    icon: Clock3
  }
];

export default function EnquiriesPage() {
  const styles = {
    page: { width: "100%" },
    heading: { marginBottom: "24px" },
    headingTitle: {
      margin: 0,
      color: "#292828",
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "24px",
      fontWeight: "600"
    },
    headingText: {
      margin: "6px 0 0",
      color: "#77736D",
      fontSize: "11px"
    },
    stats: {
      width: "100%",
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: "17px"
    },
    card: {
      minHeight: "145px",
      boxSizing: "border-box",
      padding: "20px",
      background: "#FAF8F5",
      border: "1px solid #E1DAD2",
      borderRadius: "13px"
    },
    top: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
    label: {
      margin: 0,
      color: "#7C7872",
      fontSize: "9px",
      fontWeight: "700",
      letterSpacing: "0.8px",
      textTransform: "uppercase"
    },
    value: {
      margin: "8px 0 0",
      color: "#295C65",
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "29px",
      fontWeight: "600"
    },
    icon: {
      width: "39px",
      height: "39px",
      borderRadius: "9px",
      background: "#F2EEE9",
      color: "#295C65",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    text: { margin: "17px 0 0", color: "#88847E", fontSize: "9px" },
    panel: {
      marginTop: "24px",
      background: "#FAF8F5",
      border: "1px solid #E1DAD2",
      borderRadius: "14px",
      padding: "25px 20px"
    },
    panelHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      marginBottom: "18px"
    },
    panelTitle: {
      margin: 0,
      color: "#292828",
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "20px",
      fontWeight: "600"
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#E9F2F3",
      color: "#295C65",
      borderRadius: "999px",
      padding: "6px 10px",
      fontSize: "10px",
      fontWeight: "700"
    },
    empty: {
      minHeight: "170px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      border: "1px dashed #D4C9BA",
      borderRadius: "12px",
      color: "#7E7A74",
      background: "#F9F5F1",
      fontSize: "12px"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.heading}>
        <h2 style={styles.headingTitle}>Enquiries</h2>
        <p style={styles.headingText}>Manage customer inquiries and contact requests.</p>
      </div>

      <div style={styles.stats}>
        {summary.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} style={styles.card}>
              <div style={styles.top}>
                <div>
                  <p style={styles.label}>{item.title}</p>
                  <h3 style={styles.value}>{item.value}</h3>
                </div>
                <div style={styles.icon}>
                  <Icon size={18} />
                </div>
              </div>
              <p style={styles.text}>{item.text}</p>
            </div>
          );
        })}
      </div>

      <div style={styles.panel}>
        <div style={styles.panelHeader}>
          <h3 style={styles.panelTitle}>Recent Messages</h3>
          <span style={styles.badge}>0 New</span>
        </div>

        <div style={styles.empty}>No customer enquiries have been received yet.</div>
      </div>
    </div>
  );
}
