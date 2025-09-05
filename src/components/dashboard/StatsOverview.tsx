// components/dashboard/StatsOverview.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CONSTANTS } from "../../constants/constants";

interface StatsOverviewProps {
  totalEvents: number;
  totalBookings: number;
  totalRevenue: number;
  confirmedBookings: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalEvents,
  totalBookings,
  totalRevenue,
  confirmedBookings,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statsData = [
    {
      id: "events",
      icon: "calendar-outline",
      title: "Total Events",
      value: totalEvents.toString(),
      color: CONSTANTS.PRIMARY_COLOR,
    },
    {
      id: "bookings",
      icon: "people-outline",
      title: "Total Bookings",
      value: totalBookings.toString(),
      color: "#28a745",
    },
    {
      id: "revenue",
      icon: "cash-outline",
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      color: "#fd7e14",
    },
    {
      id: "confirmed",
      icon: "checkmark-circle-outline",
      title: "Confirmed",
      value: confirmedBookings.toString(),
      color: "#20c997",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        {statsData.map((stat) => (
          <View key={stat.id} style={styles.statCard}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${stat.color}20` },
              ]}
            >
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
