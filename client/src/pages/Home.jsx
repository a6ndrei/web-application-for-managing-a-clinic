import { useNavigate } from "react-router-dom";
import axios from "axios";
import React, { useEffect } from "react";

const Home = () => {
  const navigate = useNavigate();
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/auth/home", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status !== 200) {
        navigate("/login");
      }
    } catch (error) {
      navigate("/login");
      console.log(error);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
    </div>
  );
};

export default Home;
