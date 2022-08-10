import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

interface AxiosErrorResponse {
  code?: string;
}

let cookies = parseCookies();

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies["@nextauth.token"]}`,
  },
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<AxiosErrorResponse>) => {
    if (error.response?.status === 401) {
      if (error.response?.data.code === "token.expired") {
        cookies = parseCookies();

        const { "@nextauth.refreshToken": refreshToken } = cookies;

        api
          .post("/refresh", {
            refreshToken,
          })
          .then((res) => {
            const { token } = res.data;

            setCookie(undefined, "@nextauth.token", token, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: "/",
            });
            setCookie(
              undefined,
              "@nextauth.refreshToken",
              res.data.refreshToken,
              {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/",
              }
            );
          });
      }
    }
  }
);
