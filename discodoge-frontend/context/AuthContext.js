import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { API_URL, NEXT_URL } from "@/config/index";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // register user
  const register = async (user) => {
    console.log(user);
  };

  // login user
  const login = async ({ email: identifier, password }) => {
    const res = await fetch(`${NEXT_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "json/application",
      },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();
    console.log("Auth Context Login", data);

    if (res.ok) {
      setUser(data.user);
    } else {
      setError(data.error);
      setError(null);
    }
  };

  // logout user
  const logout = async () => {
    console.log("logout");
  };

  // check if user is logged in (persist)
  const checkUserLoggedIn = async () => {
    console.log("check user");
  };

  return (
    <AuthContext.Provider value={{ user, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
