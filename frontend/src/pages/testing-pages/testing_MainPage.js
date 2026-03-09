import { useState } from "react";
import Navbar from "components/navbar/UI_Navbar";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import logo from "assets/logo/logo-full.png";
import "pages/MainPage.css";

function testing_MainPage(props) {

    return (
      <div>
        <div className="navbarHeader">
          <NavbarHeader />
        </div>
        <div className="main">
          <div className="navbar">
            <Navbar />
          </div>
          <div className="main-content">
            <div className="header-container">
              <div className="header-container-wrapper">
                <h1>Welcome to YumMeal!</h1>
              </div>
            </div>
            <p>placeholder text here please please please please work</p>
          </div>
        </div>
        <div className="bg">
          <div className="bg-logo">
            <img src={logo} alt="YumMeal Logo" />
          </div>
          <div className="bg-gradient"></div>
        </div>
      </div>
    );

}

export default testing_MainPage;
