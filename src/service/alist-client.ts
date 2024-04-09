import axios from "axios";

export const host = 'http://evans.x3322.net:6788';
export const auth = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzEyNzI4OTQzLCJuYmYiOjE3MTI1NTYxNDMsImlhdCI6MTcxMjU1NjE0M30.p4e6YkQ1Tu8zBC_WmcNtJWtILcem5tGNufrsg2qC73w';
export const client = axios.create({
    baseURL: host,
    headers: {
        Authorization: auth,
    }
});
