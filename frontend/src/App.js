import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/scroll-to-top/UI_ScrollToTop";

import Login from "pages/auth-pages/Login";
import Signup from "pages/auth-pages/Signup";
import Home from "pages/main-pages/Home";
import Pantry from "pages/main-pages/Pantry";
import SavedRecipes from "pages/main-pages/SavedRecipes";
import FindRecipes from "pages/main-pages/FindRecipes";
import MealPlan from "pages/main-pages/MealPlan";
import RecipeDetail from "pages/main-pages/RecipeDetail";
import MyRecipeDetails from "pages/main-pages/MyRecipeDetails";
import TeamRecipeDetails from "pages/main-pages/TeamRecipeDetails";
import UserProfile from "pages/main-pages/UserProfile";
import ProtectedRoute from "protectedRoute/ProtectedRoute";
import AdminProtectedRoute from "protectedRoute/AdminProtectedRoute";
import Admin from "pages/admin page/MainAdmin";

// The App component defines the main routes of the application, separating public and protected routes. It also includes a ScrollToTop component to ensure the page scrolls to the top on route changes.
export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* default page */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/find-recipes" element={<FindRecipes />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/my-recipe/:id" element={<MyRecipeDetails />} />
        <Route path="/team-recipe/:id" element={<TeamRecipeDetails />} />

        {/* protected member routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pantry"
          element={
            <ProtectedRoute>
              <Pantry />
            </ProtectedRoute>
          }
        />

        <Route
          path="/saved-recipes"
          element={
            <ProtectedRoute>
              <SavedRecipes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/meal-plan"
          element={
            <ProtectedRoute>
              <MealPlan />
            </ProtectedRoute>
          }
        />

        {/* admin routes */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <Admin />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
