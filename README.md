# Project Tuesday — v0.1.0

Creator: [Your name / GitHub username]  
Development assistance: ChatGPT  
Status: Early prototype

## What this is
An Android-oriented Expo/React Native chat app plus a Node.js backend. It connects to an OpenAI model through the Responses API and optionally enables built-in web search.

This is not a copy of ChatGPT's private model weights. API usage is billed separately from a ChatGPT subscription. The model name may need changing to one available to your API account. The detailed moral code is intentionally not finalised yet.

## Phone-only setup
Use a browser-based cloud coding workspace with a Node.js terminal (for example, Replit) on your Android phone. GitHub stores the source code; it is not itself the app builder.

### Backend
1. Create a private GitHub repository named `Project-Tuesday`.
2. Create a Node.js workspace in your cloud coding platform and copy in `backend/`.
3. In the workspace Secrets/Environment Variables, add `OPENAI_API_KEY` and `OPENAI_MODEL` (default `gpt-5.5`; change to a model enabled for your API account).
4. Run `npm install`, then `npm start`.
5. Deploy the backend and copy its HTTPS URL.

Never put your API key in the app, GitHub, screenshots, or public messages. Do not commit `.env`.

### Android app
1. Copy `mobile/` into your cloud workspace.
2. In `mobile/App.js`, replace `https://REPLACE-WITH-YOUR-BACKEND-URL` with your deployed backend HTTPS URL. Do not add `/chat`.
3. Run `npm install` from `mobile/`.
4. Configure Expo/EAS in the cloud terminal: `npx eas-cli@latest login`, then `npx eas-cli@latest build:configure`.
5. Replace the placeholder EAS project ID in `mobile/app.json` if setup gives you one.
6. Build an installable APK: `npx eas-cli@latest build --platform android --profile preview`.
7. Open the build link on your Redmi 10 and install the APK.

Cloud build services and free limits can change. Expo EAS builds Android apps in the cloud. An APK can be installed directly; an AAB is generally used for Play Store distribution.

### GitHub
Upload the project folders to your private repository. Add your preferred creator name/handle to this README. Check that no API key or `.env` file is included. Keep the repository private while developing.

## Current features
- Dark chat interface.
- Local conversation history on the phone.
- Optional web search through the Responses API.
- Backend rate limiting and input validation.
- API key stays on the backend.

## Not implemented yet
Voice, cloud-synced memory, user accounts, advanced moral-code evaluation, notifications and device integrations.

## Credits
Project concept and direction: repository owner.  
Development assistance: ChatGPT.  
OpenAI API and Expo are third-party services.
