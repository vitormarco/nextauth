import { createContext, useState } from "react";
import { api } from "../services/api";
import NextRouter from "next/router";

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

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const { data } = await api.post("sessions", {
        email,
        password,
      });
      const { toke, refreshToken, permissions, roles } = data;

      setUser({
        email,
        permissions,
        roles,
      });

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
