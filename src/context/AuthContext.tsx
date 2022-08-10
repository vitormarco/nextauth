import { createContext, useEffect, useState } from "react";
import NextRouter from "next/router";
import { setCookie, parseCookies } from "nookies";

import { api } from "../services/api";

type SignInCredentials = {
  email: string;
  password: string;
};

type UserType = {
  email: string;
  permissions: Array<string>;
  roles: Array<string>;
};

interface IAuthContextData {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user?: UserType;
}

interface IAuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext({} as IAuthContextData);

export const AuthProvider = ({ children }: IAuthProviderProps) => {
  const [user, setUser] = useState<UserType>();
  const isAuthenticated = !!user;

  useEffect(() => {
    const { "@nextauth.token": token } = parseCookies();

    if (token) {
      api.get("/me").then((res) => {
        const { email, permissions, roles } = res.data;

        setUser({ email, permissions, roles });
      });
    }
  }, []);

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const { data } = await api.post("sessions", {
        email,
        password,
      });
      const { token, refreshToken, permissions, roles } = data;

      setCookie(undefined, "@nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
      setCookie(undefined, "@nextauth.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      NextRouter.push("/dashboard");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        isAuthenticated,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
