import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAZRttP0lpLDWolCSxGI5TG3fZ_0zhyZV0",
  authDomain: "resonate-client.firebaseapp.com",
  projectId: "resonate-client",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
