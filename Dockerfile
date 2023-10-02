# Ustawienie obrazu bazowego
FROM node:18

# Ustawienie katalogu roboczego w kontenerze
WORKDIR /usr/src/app

# Kopiowanie plików package.json i package-lock.json
COPY package*.json ./

COPY ./build /usr/src/app/build
COPY ./package.json /usr/src/app

# Instalacja zależności
RUN npm install

# Kopiowanie reszty kodu źródłowego aplikacji
COPY . .

COPY prod.env .env

# Opublikowanie portu, na którym działa aplikacja
EXPOSE 3000

# Uruchomienie aplikacji
CMD ["node", "./build/index.js"]
