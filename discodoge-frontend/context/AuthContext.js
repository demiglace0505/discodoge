import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { API_URL, NEXT_URL } from "@/config/index";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  useEffect(() => checkUserLoggedIn(), []);

  // register user
  const register = async ({ email, username, password }) => {
    const res = await fetch(`${NEXT_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "json/application",
      },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();
    // console.log("AuthContext register", res, data);

    if (res.ok) {
      setUser(data.user);
      router.push("/account/dashboard");
    } else {
      setError(data.error);
      setError(null);
    }
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
    // console.log("Auth Context Login", data);

    if (res.ok) {
      setUser(data.user);
      router.push("/account/dashboard");
    } else {
      setError(data.error);
      setError(null);
    }
  };

  // logout user
  const logout = async () => {
    const res = await fetch(`${NEXT_URL}/api/logout`, {
      method: "POST",
    });

    if (res.ok) {
      setUser(null);
      router.push("/");
    }
  };

  // check if user is logged in (persist)
  const checkUserLoggedIn = async () => {
    const res = await fetch(`${NEXT_URL}/api/user`);
    const data = await res.json();

    if (res.ok) {
      setUser(data.user);
    } else {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
