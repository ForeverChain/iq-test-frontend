# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ---------- Runtime stage ----------
FROM nginx:alpine

# Railway PORT байхгүй үед fallback
ENV PORT=3000

# Built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx template
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Optional: remove default config (цэвэр)
RUN rm -f /etc/nginx/conf.d/default.conf

# Railway EXPOSE (баримжаа л, Railway-д заавал биш)
EXPOSE 3000

# Start nginx with envsubst
CMD sh -c "echo \"PORT=${PORT}\" \
  && envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf \
  && nginx -g 'daemon off;'"
