import {Router} from "https://deno.land/x/oak@v12.6.1/mod.ts";

const alist = new Router();

let token: string;
async function refreshToken() {
  const tokenResp = await fetch(
      `${Deno.env.get('host')}/api/auth/login`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
          authorization: "",
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          username: Deno.env.get('username'),
          password: Deno.env.get('password'),
        }),
        method: "POST",
      },
  );

  const tokenRespJson = await tokenResp.json();
  token = tokenRespJson.data.token;
}

async function getToken() {
  if (!token) {
    await refreshToken();
  }
  return token;
}

alist.get("/", (ctx) => {
  ctx.response.body = JSON.stringify({ message: "Hello" });
});


alist.all("/proxy/:api*", async (c) => {
  const request = c.request;

  let requestBody: any;
  if (request.hasBody){
    requestBody = await request.body({
      type: 'text'
    }).value;
  }

  const { search } = new URL(request.url)
  const url = new URL(c.params['api']!, Deno.env.get('host'))
  url.search = search

  const headers = new Headers(c.request.headers);
  const token = await getToken();

  headers.set('Host', url.hostname);
  headers.set('Authorization', token);

  const resp = await fetch(url.href, {
    method: request.method,
    headers,
    body: requestBody,
    redirect: 'manual',
  });

  c.response.body = resp.body;

});

export { alist };
