"use client";
import Axios from 'axios';

function useAxios() {
    const instance = Axios.create({
        baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    });

    instance.interceptors.request.use((config) => {
        config.withCredentials = true;        
        const csrfToken = localStorage.getItem("csrfToken");
        if (csrfToken) {
            config.headers["x-csrf-token"] = csrfToken;
        }
        
        return config;
    });

    async function get(path: string, params?: {}) {
        return instance.get(path, { params });
    }

    async function post(path: string, data: FormData | {}) {
        let type = "application/json";
        if (data instanceof FormData) {
            type = "multipart/form-data";
        }
        return instance.post(path, data, {
            headers: {
                "Content-Type": type,
            },
        });
    }

    async function put(path: string, data: FormData | {}) {
        let type = "application/json";
        if (data instanceof FormData) {
            type = "multipart/form-data";
        }
        return instance.put(path, data, {
            headers: {
                "Content-Type": type,
            },
        });
    }

    async function del(path: string) {
        return instance.delete(path);
    }

    return { get, post, put, del };
}

export default useAxios;