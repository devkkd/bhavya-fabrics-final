"use client";
import {
  Package,
  ShoppingBag,
  MessageSquare,
  IndianRupee,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";

const stats = [
  {
    title: "Total Products",
    value: "0",
    text: "Products in catalogue",
    icon: Package
  },
  {
    title: "Total Orders",
    value: "0",
    text: "Orders received",
    icon: ShoppingBag
  },
  {
    title: "Enquiries",
    value: "0",
    text: "Customer enquiries",
    icon: MessageSquare
  },
  {
    title: "Revenue",
    value: "₹0",
    text: "Total order value",
    icon: IndianRupee
  }
];

export default function DashboardPage() {
  const styles = {
    page: {
      width: "100%"
    },

    heading: {
      marginBottom:
        "24px"
    },

    headingTitle: {
      margin: 0,
      color: "#292828",
      fontFamily:
        "Georgia, 'Times New Roman', serif",
      fontSize: "24px",
      fontWeight: "600"
    },

    headingText: {
      margin:
        "6px 0 0",
      color: "#77736D",
      fontSize: "11px"
    },

    stats: {
      width: "100%",
      display: "grid",
      gridTemplateColumns:
        "repeat(4, 1fr)",
      gap: "17px"
    },

    card: {
      minHeight: "145px",
      boxSizing: "border-box",
      padding: "20px",
      background: "#FAF8F5",
      border:
        "1px solid #E1DAD2",
      borderRadius: "13px"
    },

    top: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent:
        "space-between"
    },

    label: {
      margin: 0,
      color: "#7C7872",
      fontSize: "9px",
      fontWeight: "700",
      letterSpacing:
        "0.8px",
      textTransform:
        "uppercase"
    },

    value: {
      margin:
        "8px 0 0",
      color: "#295C65",
      fontFamily:
        "Georgia, 'Times New Roman', serif",
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

    text: {
      margin:
        "17px 0 0",
      color: "#88847E",
      fontSize: "9px"
    },

    empty: {
      minHeight: "240px",
      marginTop: "20px",
      background: "#FAF8F5",
      border:
        "1px dashed #D1C9C0",
      borderRadius: "13px",
      display: "flex",
      alignItems: "center",
      justifyContent:
        "center",
      flexDirection:
        "column",
      textAlign: "center",
      color: "#89857F"
    },

    emptyIcon: {
      color: "#BE9D6B"
    },

    emptyTitle: {
      margin:
        "12px 0 0",
      color: "#4A4743",
      fontFamily:
        "Georgia, 'Times New Roman', serif",
      fontSize: "18px"
    },

    emptyText: {
      margin:
        "6px 0 0",
      fontSize: "10px"
    }
  };

  return (
    <div style={styles.page}>

      <div
        style={styles.heading}
      >
        <h2
          style={
            styles.headingTitle
          }
        >
          Dashboard Overview
        </h2>

        <p
          style={
            styles.headingText
          }
        >
          Welcome to Bhavya
          Fabrics administration
          panel.
        </p>
      </div>

      <div
        style={styles.stats}
      >
        {stats.map((stat) => {
          const Icon =
            stat.icon;

          return (
            <div
              key={stat.title}
              style={styles.card}
            >
              <div
                style={styles.top}
              >
                <div>
                  <p
                    style={
                      styles.label
                    }
                  >
                    {stat.title}
                  </p>

                  <h3
                    style={
                      styles.value
                    }
                  >
                    {stat.value}
                  </h3>
                </div>

                <div
                  style={
                    styles.icon
                  }
                >
                  <Icon
                    size={19}
                  />
                </div>
              </div>

              <p
                style={styles.text}
              >
                {stat.text}
              </p>
            </div>
          );
        })}
      </div>

      <div
        style={
          styles.empty
        }
      >
        <TrendingUp
          size={34}
          style={
            styles.emptyIcon
          }
        />

        <h3
          style={
            styles.emptyTitle
          }
        >
          Dashboard Ready
        </h3>

        <p
          style={
            styles.emptyText
          }
        >
          Live statistics will
          appear here once
          products, orders and
          enquiries are connected.
        </p>
      </div>

      <style jsx global>{`
        @media (max-width: 1100px) {
          .admin-stat-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}