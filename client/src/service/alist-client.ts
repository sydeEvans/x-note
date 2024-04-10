import axios from "axios";

export const host = '/api/alist/proxy';
export const client = axios.create({
    baseURL: host
});
