// app/(app)/organizer/attendees.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EventAttendeesCard from "../../../../components/EventAttendeesCard";
import { CONSTANTS } from "../../../../constants/constants";
import { useAuth } from "../../../../context/AuthContext";
import {
  EventSummary,
  getOrganizerEventsWithAttendees,
} from "../../../../lib/organizer/attendees";

const AttendeesScreen: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(
    async (pageNum: number = 1, isRefresh: boolean = false) => {
      if (!user?.id) return;

      try {
        console.log("[Attendees|Index] fetchEvents START", {
          pageNum,
          isRefresh,
          userId: user.id,
        });
        setError(null);
        if (pageNum === 1 && !isRefresh) setLoading(true);
        if (pageNum > 1) setLoadingMore(true);

        const result = await getOrganizerEventsWithAttendees(
          user.id,
          pageNum,
          10
        );

        console.log("[Attendees|Index] fetchEvents result", {
          received: result.events.length,
          hasMore: result.hasMore,
          totalCount: result.totalCount,
        });

        if (pageNum === 1) {
          setEvents(result.events);
        } else {
          setEvents((prev) => [...prev, ...result.events]);
        }

        setHasMore(result.hasMore);
        setPage(pageNum);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load events. Please try again.");
      } finally {
        console.log("[Attendees|Index] fetchEvents FINALLY", { pageNum });
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRefresh = () => {
    console.log("[Attendees|Index] handleRefresh");
    setRefreshing(true);
    fetchEvents(1, true);
  };

  const handleLoadMore = () => {
    console.log("[Attendees|Index] handleLoadMore", {
      loadingMore,
      hasMore,
      nextPage: page + 1,
    });
    if (!loadingMore && hasMore) {
      fetchEvents(page + 1);
    }
  };

  const handleEventPress = (id: string) => {
    console.log("[Attendees|Index] navigate to detail", { id });
    router.push(`/(app)/organizer/attendees/${id}` as any);
  };

  const handleEventTitlePress = (id: string) => {
    console.log("[Attendees|Index] navigate to event detail", { id });
    router.push(`/(app)/organizer/events/${id}` as any);
  };

  const renderEvent = ({ item }: { item: EventSummary }) => (
    <EventAttendeesCard
      event={item}
      onPress={() => handleEventPress(item.id)}
      onPressTitle={() => handleEventTitlePress(item.id)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Event Attendees</Text>
        <Text style={styles.headerSubtitle}>Manage and view attendees</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#CCC" />
      <Text style={styles.emptyTitle}>No Events Yet</Text>
      <Text style={styles.emptyMessage}>
        Create your first event to start seeing attendees here
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={CONSTANTS.PRIMARY_COLOR} />
        <Text style={styles.footerText}>Loading more events...</Text>
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error}</Text>
    </View>
  );

  if (loading && events.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CONSTANTS.PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  if (error && events.length === 0) {
    return renderError();
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <View style={styles.containerInner}>
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={events.length === 0 ? renderEmpty : null}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[CONSTANTS.PRIMARY_COLOR]}
              tintColor={CONSTANTS.PRIMARY_COLOR}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            events.length === 0 ? styles.emptyContentContainer : undefined
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  containerInner: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 24,
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#F8F9FA",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 24,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  footerLoader: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
});

export default AttendeesScreen;
