"use client";

import { ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import WebSocket from "@/hooks/Socket";
import useAxios from "@/hooks/Axios";

const queryClient = new QueryClient();

const MasterProvider = ({ children }: { children: ReactNode }) => {
  const { get } = useAxios();

  const fetchCsrfToken = async () => {
    const response = await get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/keep-alive`);
    const token = response.data.token;
    localStorage.setItem("csrfToken", token);
    return response;
  }

  useEffect(() => {
    fetchCsrfToken();    
    const interval = setInterval(fetchCsrfToken, 1000 * 60 * 15);

    WebSocket.init();

    WebSocket.on("connect", () => {
      toast.success("Connected to websocket server");
    });

    WebSocket.on("notification", (data: { message: string; type?: string }) => {
      if (data.type === "error") {
        toast.error(data.message);
      }

      if (data.type === "success") {
        toast.success(data.message);
      }
    });

    WebSocket.emit("identify");
    return () => {
      clearInterval(interval);
      WebSocket.close();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default MasterProvider;
