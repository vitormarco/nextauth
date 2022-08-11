import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

interface AxiosErrorResponse {
  code?: string;
}

type FailedRequestQueue = Array<{
  onSuccess: (token: string) => void;
  onFailure: (err: AxiosError) => void;
}>;

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestQueu: FailedRequestQueue = [];

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies["@nextauth.token"]}`,
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<AxiosErrorResponse>) => {
    // FIX: Vítor - Pensar em uma forma de diminuir a sequencia de ifs, talvez com return?
    console.log(error);
    if (error.response?.status === 401) {
      if (error.response.data.code === "token.expired") {
        cookies = parseCookies();

        const { "@nextauth.refreshToken": refreshToken } = cookies;
        const originalConfig = error.config;

        if (!isRefreshing) {
          isRefreshing = true;

          api
            .post("/refresh", {
              refreshToken,
            })
            .then((response) => {
              console.log(response);
              const { token } = response.data;

              setCookie(undefined, "@nextauth.token", token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: "/",
              });
              setCookie(
                undefined,
                "@nextauth.refreshToken",
                response.data.refreshToken,
                {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: "/",
                }
              );

              failedRequestQueu.forEach((request) => request.onSuccess(token));
              failedRequestQueu = [];
            })
            .catch((err) => {
              failedRequestQueu.forEach((req) => req.onFailure(err));
              failedRequestQueu = [];
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        return new Promise((resolve, reject) => {
          failedRequestQueu.push({
            onSuccess: (token: string) => {
              originalConfig.headers = {
                Authorization: `Bearer ${token}`,
              };

              resolve(api(originalConfig));
            },
            onFailure: (err: AxiosError) => {
              reject(err);
            },
          });
        });
      }
    } else {
      // deslogar o usuário
    }
  }
);
