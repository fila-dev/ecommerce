import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CardDetails from "../components/CardDetails";
import Categories from "../components/Categories";
import Footer from "../components/Footer";
import { useCardsContext } from "../hooks/useCardsContext";
import { useAuthContext } from "../hooks/useAuthContext";
import Hero from "../components/Hero";
const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { cards, dispatch } = useCardsContext();
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let url = `${import.meta.env.VITE_API_BASE_URL}/`;
        if (selectedCategory) {
          url = `${import.meta.env.VITE_API_BASE_URL}/category?category=${encodeURIComponent(
            selectedCategory
          )}`;
        }
        if (selectedCategory === "All") {
          url = `${import.meta.env.VITE_API_BASE_URL}/`;
        }

        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        const json = await response.json();

        if (response.ok) {
          dispatch({ type: "SET_CARDS", payload: json });
        } else {
          setError(json.error || "Failed to fetch cards");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Failed to connect to the server");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [dispatch, selectedCategory]);

  const handleCategorySelect = (category) => {
    const newCategory = category || ""; // Ensure empty string for home
    setSelectedCategory(newCategory);
    setSearchParams(newCategory ? { category: newCategory.toLowerCase() } : {});
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      {!user && <Hero />}
      <Categories
        onSelectCategory={handleCategorySelect}
        selectedCategory={selectedCategory}
      />
      <div className="mt-0">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : cards.length > 0 ? (
          <CardDetails cards={cards} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No products available</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Home;
