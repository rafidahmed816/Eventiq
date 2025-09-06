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
import { FilterModal } from "../../../../components/FilterModal";
import { SearchBar } from "../../../../components/SearchBar";
import {
  EventsResponse,
  fetchTravelerEvents,
  TravelerEvent,
} from "../../../../lib/traveler/events";

const ITEMS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 500;

interface FilterOptions {
  categories: string[];
  priceRanges: string[];
  durations: string[];
  dates: string[];
}

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
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    categories: [],
    priceRanges: [],
    durations: [],
    dates: [],
  });

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

  // Effect to reload events when filters are applied
  useEffect(() => {
    // We don't want this to run on initial mount, so we check if filters are not in their initial state.
    const isInitialState =
      activeFilters.categories.length === 0 &&
      activeFilters.dates.length === 0 &&
      activeFilters.durations.length === 0 &&
      activeFilters.priceRanges.length === 0;

    // Also, don't run if it's just the initial load.
    if (!loading && !isInitialState) {
      loadEvents(true);
    }
  }, [activeFilters]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      // Only trigger search from here. Filtering is handled by its own effect.
      handleSearch();
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
        ITEMS_PER_PAGE,
        searchQuery,
        selectedCategory,
        activeFilters
      );

      if (reset) {
        // Remove duplicates when resetting
        const uniqueEvents = response.events.filter(
          (event, index, self) =>
            index === self.findIndex((e) => e.id === event.id)
        );
        setEvents(uniqueEvents);
      } else {
        // Remove duplicates when adding more events
        setEvents((prev) => {
          const allEvents = [...prev, ...response.events];
          return allEvents.filter(
            (event, index, self) =>
              index === self.findIndex((e) => e.id === event.id)
          );
        });
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
      // Use fetchTravelerEvents to leverage filtering capabilities
      const response = await fetchTravelerEvents(
        1,
        ITEMS_PER_PAGE,
        searchQuery,
        selectedCategory,
        activeFilters
      );

      // Remove duplicates from search results
      const uniqueResults = response.events.filter(
        (event, index, self) =>
          index === self.findIndex((e) => e.id === event.id)
      );

      setEvents(uniqueResults);
      setHasMore(response.hasMore);
      setCurrentPage(response.nextPage || 1);
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
    setActiveFilters({
      categories: [],
      priceRanges: [],
      durations: [],
      dates: [],
    });
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

  const handleFilterPress = () => {
    setFilterModalVisible(true);
  };

  const handleFilterApply = (filters: FilterOptions) => {
    setActiveFilters(filters);
    // You can implement actual filtering logic here based on the filters
    // For now, we'll trigger a search with the existing logic
    loadEvents(true);
  };

  const getActiveFiltersCount = () => {
    return (
      activeFilters.categories.length +
      activeFilters.priceRanges.length +
      activeFilters.durations.length +
      activeFilters.dates.length
    );
  };

  const renderEventCard = ({
    item,
    index,
  }: {
    item: TravelerEvent;
    index: number;
  }) => <EventFeedCard event={item} onPress={() => handleEventPress(item)} />;

  // Use combination of ID and index for maximum uniqueness
  const keyExtractor = (item: TravelerEvent, index: number) =>
    `event-${item.id}-${index}`;

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
        onFilterPress={handleFilterPress}
        activeFiltersCount={getActiveFiltersCount()}
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
        keyExtractor={keyExtractor}
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

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
        initialFilters={activeFilters}
      />
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
