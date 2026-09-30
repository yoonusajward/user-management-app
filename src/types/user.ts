import { Timestamp } from "firebase/firestore";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  createdAt: Timestamp | null;
};