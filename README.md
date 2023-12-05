## Spin <3 Spotify

This is a simple application that calls Spotify Developer APIs to generate a 20 song playlist based on your most popular, recent songs. To get started, follow these steps:

1. Clone this repo and move into current directory
2. Make an account (if you don't have one already) and create an [application](https://developer.spotify.com/documentation/web-api/concepts/apps) on [Spotify For Developers](https://developer.spotify.com/dashboard) with the following fields:

   a.  `App name`: whatever you'd like

   b. `Redirect uri`: http://127.0.0.1:3000/internal/login/callback; http://localhost:3000/internal/login/callback

   c. Check [X] *Web API* under the question "Which API/SDKs are you planning to use"
3. Click save and make note of the client ID and client secret. 
```bash
CLIENT_ID=<your-client-id>
CLIENT_SECRET=<your-client-secret>
```
4. Install dependencies, then build and run your application locally
```bash
npm install
SPIN_VARIABLE_CLIENT_ID=$CLIENT_ID SPIN_VARIABLE_CLIENT_SECRET=$CLIENT_SECRET spin build --up
```

Test your application by visiting [localhost:3000](http://localhost:3000/) in your browser!
5. (Optional) Deploy to Fermyon Cloud. First, add the Fermyon custom subdomain you'd like to use to your [Spotify app's](https://developer.spotify.com/dashboard) list of redirect URLs. There should be an edit button at the bottom of the screen when you click into the application. Then deploy to Cloud via the following command:
```bash
spin deploy --variable CLIENT_ID=$CLIENT_ID CLIENT_SECRET=$CLIENT_SECRET
```