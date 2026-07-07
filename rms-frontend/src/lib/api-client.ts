import axios from "axios";

export const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL,

  headers: {
    "Content-Type":
      "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    console.log(
      "TOKEN =>",
      token
    );

    console.log(
      "REQUEST =>",
      config.url
    );

    if (token) {

      console.log(
        "AUTH HEADER ADDED"
      );

      config.headers.Authorization =
        `Bearer ${token}`;
    }
    else {

      console.log(
        "NO TOKEN FOUND"
      );

    }

    return config;
  }
);