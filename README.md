# License
This project is distributed under the MIT license

# About this Project
This project uses Web Components and Firebase to build a simple shopping list app.

## Deploy - Frontend
1. firebase logout
2. firebase login
3. firebase deploy --only hosting

## Deploy - Backend
 1. Download Service Account Credentials JSON
 `https://console.firebase.google.com/project/shopping-list-app-d0386/settings/serviceaccounts/adminsdk?hl=ja`
 2. Place shopping-list-app-d0386-firebase-adminsdk-4n6jo-97fc02004b.json in server/ root directory.
 3. `heroku login`
 4. `docker build -t registry.heroku.com/<PROJECT-NAME: shopping-list-notifications>/web --platform linux/amd64 .`
 5. `docker push registry.heroku.com/shopping-list-notifications/web `
 6. `heroku container:release web -a shopping-list-notifications`



## Setting up Development Environment
```
yarn install
yarn mkcert
yarn start
```
