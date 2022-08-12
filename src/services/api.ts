import axios, { AxiosError } from "axios";
import { GetServerSidePropsContext } from "next";
import { parseCookies, setCookie } from "nookies";
import { signOut } from "../context/AuthContext";
import { AuthTokenError } from "./errors/AuthTokenError";

interface AxiosErrorResponse {
  code?: string;
}

type FailedRequestQueue = Array<{
  onSuccess: (token: string) => void;
  onFailure: (err: AxiosError) => void;
}>;

let isRefreshing = false;
let failedRequestQueu: FailedRequestQueue = [];

export function setupApiClient(
  ctx: GetServerSidePropsContext | undefined = undefined
) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
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
                const { token } = response.data;

                setCookie(ctx, "@nextauth.token", token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: "/",
                });
                setCookie(
                  ctx,
                  "@nextauth.refreshToken",
                  response.data.refreshToken,
                  {
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                    path: "/",
                  }
                );

                failedRequestQueu.forEach((request) =>
                  request.onSuccess(token)
                );
                failedRequestQueu = [];
              })
              .catch((err) => {
                failedRequestQueu.forEach((req) => req.onFailure(err));
                failedRequestQueu = [];

                if (process.browser) signOut();
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
        } else {
          if (process.browser) signOut();
          return Promise.reject(new AuthTokenError());
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
}
