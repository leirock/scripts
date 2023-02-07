HTTP Proxy for Waline avatar
=============================

This is a proxy server using [request](https://github.com/request/request) that handles redirects for avatars in Waline comments system. 

## Quick start

### Install dependencies

```sh
npm install
# you can also use yarn to install
yarn install
```

### Start the server

```sh
node index.js
```

## Reverse proxy

Here is an example for Nginx setting with cache

```nginx
location /
{
    proxy_pass http://localhost:8080;
    proxy_set_header Host localhost;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header REMOTE-HOST $remote_addr;
    
    add_header X-Cache $upstream_cache_status;
	#Set Nginx Cache

    proxy_ignore_headers Set-Cookie Cache-Control expires;
    proxy_cache cache_one;
    proxy_cache_key $host$uri$is_args$args;
    proxy_cache_valid 200 304 301 302 1m;
}
```

Then you can use it by hitting your proxy URL `http://domain.com:8080/?url=[your_url]`
