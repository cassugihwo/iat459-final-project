import React, { useEffect, useState } from "react";
// import UI_Navbar from 'components/navbar/ui_Navbar';
import TestingMainPage from 'pages/testing-pages/Testing_MainPage';
import TestingLogin from "pages/testing-pages/Testing_Login";
import TestingSignup from "pages/testing-pages/Testing_Signup";


export default function App() {
  // 0: main page, 1: login page, 2: signup page
  const [testCurrentView, setTestCurrentView] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Note: We use the FULL URL. There is no proxy to infer the host.
    fetch("http://localhost:5000/api/hello")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  let pageContent;
  switch (testCurrentView) {
    case 0:
      pageContent = <TestingMainPage/>;
      break;
    case 1:
      pageContent = <TestingLogin/>;
      break;
    case 2:
      pageContent = <TestingSignup/>;
      break;
    default:
      pageContent = <TestingMainPage/>;
  }

  // <div>
  //   <p>Server says: {message}</p>
  // </div>;
  
  return (
    <div>
      <div>{pageContent}</div>
    </div>
  );
}