import { useState } from "react";
import "pages/MainPage.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import Navbar from "components/navbar/UI_Navbar";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";

function FindRecipes(props) {
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
                            <h1>Find Recipes</h1>
                            <p>Find recipes based on your ingredients</p>
                        </div>
                    </div>

                    <p>placeholder text here</p>

                </div>
            </div>
        </div>
    );
}

export default FindRecipes;
