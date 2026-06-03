
# Étape 1 : Construction de l'application
FROM node:20-alpine AS build
WORKDIR /app

# Copie des fichiers de configuration
COPY package*.json ./

# Installation propre des dépendances (sans tsc)
RUN npm ci

# Copie de tout le reste du code (y compris l'index.html)
COPY . .

# Lancement du build configuré dans le package.json (qui contient "vite build")
RUN npm run build

# Étape 2 : Serveur de production (Nginx)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.fr/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]