FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Nginx web server stage
FROM nginx:alpine

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy custom nginx config to support React SPA Routing redirect fallback
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $$uri $$uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://backend:5000; \
        proxy_set_header Host $$host; \
        proxy_set_header X-Real-IP $$remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
