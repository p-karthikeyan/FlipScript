import { Metadata } from "next";
import WritingToolForBeginnersClient from "./WritingToolForBeginnersClient";

export const metadata: Metadata = {
  title: "Easy Writing Tool for Beginners | Free Flip Book Creator | FlipScript",
  description: "New to writing? FlipScript is the easiest writing tool for beginners. Use our immersive flip book creator free of charge and start your author journey today.",
  keywords: ["writing tool for beginners", "immersive flip book creator free", "story writing app free", "online story writing tool free"]
};

export default function WritingToolForBeginnersPage() {
  return <WritingToolForBeginnersClient />;
}
