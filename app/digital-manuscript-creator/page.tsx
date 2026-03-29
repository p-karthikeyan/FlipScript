import { Metadata } from "next";
import DigitalManuscriptCreatorClient from "./DigitalManuscriptCreatorClient";

export const metadata: Metadata = {
  title: "Digital Manuscript Creator | Hand-Written Book Online | FlipScript",
  description: "FlipScript is the leading digital manuscript creator for modern authors. Craft a digital hand-written book online with secure storage and immersive reading.",
  keywords: ["digital manuscript creator", "digital hand-written book online", "online story writing tool free", "write books online with autosave"]
};

export default function DigitalManuscriptCreatorPage() {
  return <DigitalManuscriptCreatorClient />;
}
