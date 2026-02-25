import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCFj_nT5tKcPD4JOOzank9G6Cjw_Fs6Y8M",
  authDomain: "resonate-health.firebaseapp.com",
  projectId: "resonate-health",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
