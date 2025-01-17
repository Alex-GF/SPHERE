FROM nginx:1.27.3

ENV http_proxy http://proxy.int.local:3128
ENV https_proxy https://proxy.int.local:3128

RUN apt-get update
RUN apt-get install -y git libc-dev gcc nano bash
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

WORKDIR /usr/src/app