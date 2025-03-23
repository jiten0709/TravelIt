# Use Nginx to serve the frontend
FROM nginx:alpine

# Copy the static files (HTML, CSS, JS) to Nginx's HTML directory
COPY . /usr/share/nginx/html

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the frontend port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]