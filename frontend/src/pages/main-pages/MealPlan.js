import { useState, useEffect, useCallback } from "react";
import "pages/MainPage.css";
import "pages/page-css/MealPlan.css";
import { Plus } from "lucide-react";
import Navbar from "components/navbar/UI_Navbar";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import Footer from "components/footer/UI_Footer";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";
import MealPlanSchedule from "components/meal-plan/UI_MealPlanSchedule";
import MealPlanCard from "components/meal-plan/UI_MealPlanCard";
import Toast from "components/toast/UI_Toast";
import { useAuth } from "context/AuthContext";

const API = "http://localhost:5001";

function MealPlan() {
  const { token } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const selectedPlan = plans.find((p) => p._id === selectedPlanId) ?? null;

  const showToast = useCallback((msg) => {
    setToast({ msg, key: Date.now() });
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API}/api/meal-plans`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setPlans(data);
        if (data.length > 0) setSelectedPlanId(data[0]._id);
      })
      .catch(() => showToast("Failed to load meal plans."))
      .finally(() => setLoading(false));
  }, [token, showToast]);

  async function handleCreatePlan() {
    if (!token) return;
    try {
      const title = `My Meal Plan ${plans.length + 1}`;
      const res = await fetch(`${API}/api/meal-plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error();
      const newPlan = await res.json();
      setPlans((prev) => [newPlan, ...prev]);
      setSelectedPlanId(newPlan._id);
      showToast("Meal plan created!");
    } catch {
      showToast("Failed to create meal plan.");
    }
  }

  async function handleDeletePlan(planId) {
    try {
      const res = await fetch(`${API}/api/meal-plans/${planId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setPlans((prev) => {
        const remaining = prev.filter((p) => p._id !== planId);
        setSelectedPlanId(remaining.length > 0 ? remaining[0]._id : null);
        return remaining;
      });
      showToast("Meal plan deleted.");
    } catch {
      showToast("Failed to delete meal plan.");
    }
  }

  async function handleSavePlan(updatedPlan) {
    try {
      const res = await fetch(`${API}/api/meal-plans/${updatedPlan._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: updatedPlan.title, plan: updatedPlan.plan }),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      setPlans((prev) => prev.map((p) => (p._id === saved._id ? saved : p)));
      showToast("Meal plan saved!");
    } catch {
      showToast("Failed to save meal plan.");
    }
  }

  return (
    <div className="home-page">
      <div className="navbarHeader">
        <NavbarHeader />
      </div>

      <div className="bg">
        <div className="bg-food bg-food-left">
          <img src={leftDish} alt="Decorative dish" />
        </div>
        <div className="bg-food bg-food-center">
          <img src={centerDish} alt="Decorative dish" />
        </div>
        <div className="bg-food bg-food-right">
          <img src={rightDish} alt="Decorative dish" />
        </div>
        <div className="bg-logo">
          <img src={logo} alt="YumMeal Logo" />
        </div>
        <div className="bg-gradient"></div>
      </div>

      <div className="main">
        <div className="navbar">
          <Navbar />
        </div>

        <div className="main-content">
          <div className="header-container">
            <div className="header-container-wrapper">
              <h1>Meal Plans</h1>
            </div>
          </div>
          <div className="mp-body">
            <div className="mps-body">
              <h2>Your Meal Plan</h2>

              {loading && <p className="mps-hint">Loading...</p>}

              {!loading && !selectedPlan && (
                <div>
                  <p className="mps-hint">Create your first meal plan!</p>
                  <button
                    className="mps-schedule-card-container mps-schedule-card-add"
                    onClick={handleCreatePlan}
                    aria-label="Create new meal plan"
                  >
                    <Plus size={26} />
                    <span>New Plan</span>
                  </button>
                </div>
              )}

              {selectedPlan && (
                <MealPlanSchedule plan={selectedPlan} onSave={handleSavePlan} />
              )}

              <h2>Your Plans</h2>
              <div className="mps-carousel-wrapper">
                <div className="mps-carousel">
                  <button
                    className="mps-schedule-card-container mps-schedule-card-add"
                    onClick={handleCreatePlan}
                    aria-label="Create new meal plan"
                  >
                    <Plus size={26} />
                    <span>New Plan</span>
                  </button>

                  {plans.map((plan) => (
                    <MealPlanCard
                      key={plan._id}
                      plan={plan}
                      isSelected={plan._id === selectedPlanId}
                      onClick={() => setSelectedPlanId(plan._id)}
                      onDelete={() => handleDeletePlan(plan._id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      {toast && (
        <Toast
          key={toast.key}
          message={toast.msg}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default MealPlan;
