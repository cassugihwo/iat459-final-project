import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "pages/auth-pages/Login";
import Signup from "pages/auth-pages/Signup";
import Home from "pages/main-pages/Home";
import Pantry from "pages/main-pages/Pantry";
import SavedRecipes from "pages/main-pages/SavedRecipes";
import FindRecipes from "pages/main-pages/FindRecipes";
import MealPlan from "pages/main-pages/MealPlan";

import ProtectedRoute from "components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
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
        path="/find-recipes"
        element={
          <ProtectedRoute>
            <FindRecipes />
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