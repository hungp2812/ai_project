FROM nginx:alpine

# Copy NGINX config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy toàn bộ frontend nội dung vào nginx web dir
COPY html/ /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY javascript/ /usr/share/nginx/html/javascript/
COPY pictures/ /usr/share/nginx/html/pictures/
