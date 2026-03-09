import { useState } from "react";
import "./UI_Navbar.css";
import logo from "assets/logo/logo-noslogan.png";

function UI_NavbarHeader(props) {
    
    const [testCurrentState, setTestCurrentState] = useState(1);

    let stateContent;
    switch (testCurrentState) {
      case 0:
        stateContent = (
          <div className="userProfilePicture"></div>
        );
        break;
      default:
        stateContent = (<div className="buttons">
          <button className="buttonLogin">Login</button>
          <button className="buttonSignup">Signup</button>
        </div>);
    }

    return (
      <div className="navbarHeader-container">
        <div className="logo">
          <img src={logo} alt="YumMeal Logo"/>
        </div>
        <div className="rightside">
          {stateContent}
        </div>
      </div>
    );

}

export default UI_NavbarHeader;