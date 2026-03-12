import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "pages/auth-pages/Login";
import Signup from "pages/auth-pages/Signup";
import Home from "pages/main-pages/Home";
import Pantry from "pages/main-pages/Pantry";
import SavedRecipes from "pages/main-pages/SavedRecipes";
import FindRecipes from "pages/main-pages/FindRecipes";
import MealPlan from "pages/main-pages/MealPlan";
import MemberOnly from "pages/main-pages/MemberOnly";

import ProtectedRoute from "components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* default page */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="/find-recipes" element={<FindRecipes />} />
      <Route path="/member-only" element={<MemberOnly />} />

      {/* protected member routes */}
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

    </Routes>
  );
}