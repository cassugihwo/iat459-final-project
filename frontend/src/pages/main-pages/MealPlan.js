import { useState } from "react";
import "pages/MainPage.css";
import "pages/page-css/MealPlan.css";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import Navbar from "components/navbar/UI_Navbar";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import Icon_timer from "assets/icons/icon-timer-red.svg";
import UIMealPlanModal from "components/meal-plan/UI_MealPlanModal";
import Logo from "assets/logo/logo-full.png";
import Footer from "components/footer/UI_Footer";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";
import MealPlanSchedule from "components/meal-plan/UI_MealPlanSchedule";

function MealPlan(props) {
  function MealPlanScheduleCard({ title = "Placeholder Meal Plan Title" }) {
    return (
      <div className="mps-mealplan-card">
        <h3>{title}</h3>
      </div>
    );
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
              <h1>Meal Schedule</h1>
            </div>
          </div>
          <div className="mp-body">
            <div className="mps-body">
              <h2>Your Meal Plan</h2>
              <MealPlanSchedule />
              <h2>Your Schedules</h2>
              <div className="mps-carousel-wrapper">
                <div className="mps-carousel">
                  <MealPlanScheduleCard title="Week 1 Plan" />
                  <MealPlanScheduleCard title="Week 2 Plan" />
                  <MealPlanScheduleCard title="Week 3 Plan" />
                  <MealPlanScheduleCard title="Week 4 Plan" />
                  <MealPlanScheduleCard title="Week 4 Plan" />
                  <MealPlanScheduleCard title="Week 4 Plan" />
                  <MealPlanScheduleCard title="Week 4 Plan" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default MealPlan;
