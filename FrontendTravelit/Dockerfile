FROM nginx:latest

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy frontend files
COPY . /usr/share/nginx/html

# Nginx runs inside the container on port 80
EXPOSE 80  

CMD ["nginx", "-g", "daemon off;"]
