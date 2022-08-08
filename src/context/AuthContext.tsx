import { createContext } from "react";
import { api } from "../services/api";

type SignInCredentials = {
  email: string;
  password: string;
};

interface IAuthContextData {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
}

interface IAuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext({} as IAuthContextData);

export const AuthProvider = ({ children }: IAuthProviderProps) => {
  const isAuthenticated = false;

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const response = await api.post("sessions", {
        email,
        password,
      });
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
