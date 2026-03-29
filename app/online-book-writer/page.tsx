import { Metadata } from "next";
import OnlineBookWriterClient from "./OnlineBookWriterClient";

export const metadata: Metadata = {
  title: "Online Story Writing Tool Free | FlipScript - Write Your Book Now",
  description: "FlipScript is the ultimate online story writing tool free of distractions. Write books online with autosave and experience immersive digital book writing.",
  keywords: ["online story writing tool free", "write books online with autosave", "online book writer", "best writing app for novel writers"]
};

export default function OnlineBookWriterPage() {
  return <OnlineBookWriterClient />;
}
