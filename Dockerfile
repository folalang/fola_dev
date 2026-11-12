# Serves the prebuilt site in ./public. Build it first:
#   ../fola/zig-out/bin/fola run build.fola
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/
EXPOSE 8080
