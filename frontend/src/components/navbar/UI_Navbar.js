import { useState } from "react";
import "./UI_Navbar.css";
import { useAuth } from "context/AuthContext";

function UI_Navbar(props) {
  const [testCurrentSelectButton, setTestCurrentSelectButton] = useState(1);

  let stateContent;
  switch (testCurrentSelectButton) {
    case 0:
      stateContent = <div className="userProfilePicture"></div>;
      break;
    default:
      stateContent = (
        <div className="buttons">
          <button className="buttonLogin">Login</button>
          <button className="buttonSignup">Signup</button>
        </div>
      );
  }

  return (
    <div className="navbar-container">
      <ul>
        <li>
          <a className="selected">Home</a>
        </li>
        <li>
          <a>Find Recipes</a>
        </li>
        <li>
          <a>Your Pantry</a>
        </li>
        <li>
            <a>Your Recipe List</a>
        </li>
        <li>
            <a>Your Meal Plan</a>
        </li>
      </ul>
    </div>
  );
}

export default UI_Navbar;

