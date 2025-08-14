// app/(app)/traveler/events/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryFilter } from "../../../../components/CategoryFilter";
import { EventFeedCard } from "../../../../components/EventFeedCard";
import { SearchBar } from "../../../../components/SearchBar";
import {
  EventsResponse,
  fetchTravelerEvents,
  searchEvents,
  TravelerEvent,
} from "../../../../lib/traveler/events";

const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 500;

export default function TravelerEventsScreen() {
  const [events, setEvents] = useState<TravelerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    loadEvents(true);
  }, []);

  // Refresh events when screen comes into focus (e.g., returning from booking)
  useFocusEffect(
    useCallback(() => {
      // Only refresh if we're not already loading and have existing events
      if (!loading && events.length > 0) {
        loadEvents(true);
      }
    }, [loading, events.length])
  );

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (searchQuery.trim() || selectedCategory !== "All") {
        handleSearch();
      } else {
        loadEvents(true);
      }
    }, SEARCH_DEBOUNCE_MS);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery, selectedCategory]);

  const loadEvents = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 1 : currentPage;
      const response: EventsResponse = await fetchTravelerEvents(
        page,
        ITEMS_PER_PAGE
      );

      if (reset) {
        setEvents(response.events);
      } else {
        setEvents((prev) => [...prev, ...response.events]);
      }

      setHasMore(response.hasMore);
      setCurrentPage(response.nextPage || page);
    } catch (error) {
      console.error("Load events error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };
  
  const handleSearch = async () => {
    try {
      setLoading(true);
      const results = await searchEvents(
        searchQuery,
        selectedCategory === "All" ? undefined : selectedCategory
      );
      setEvents(results);
      setHasMore(false); 
      setCurrentPage(1);
    } catch (error) {
      console.error("Search error:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setSearchQuery("");
    setSelectedCategory("All");
    loadEvents(true);
  };

  const handleLoadMore = () => {
    if (
      !loadingMore &&
      hasMore &&
      !searchQuery.trim() &&
      selectedCategory === "All"
    ) {
      loadEvents(false);
    }
  };

  const handleEventPress = (event: TravelerEvent) => {
    router.push(`/(app)/traveler/events/${event.id}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
  };

  const renderEventCard = ({ item }: { item: TravelerEvent }) => (
    <EventFeedCard event={item} onPress={() => handleEventPress(item)} />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading more events...</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;

    const isSearching = searchQuery.trim() || selectedCategory !== "All";

    return (
      <View style={styles.emptyState}>
        <Ionicons
          name={isSearching ? "search-outline" : "calendar-outline"}
          size={64}
          color="#ccc"
        />
        <Text style={styles.emptyStateTitle}>
          {isSearching ? "No events found" : "No events available"}
        </Text>
        <Text style={styles.emptyStateText}>
          {isSearching
            ? "Try adjusting your search or filters"
            : "Check back later for new events"}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={handleSearchClear}
      />

      {/* Category Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Events List */}
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Loading Overlay */}
      {loading && events.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginTop: Platform.OS === "android" ? 0 : 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(248, 249, 250, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});
