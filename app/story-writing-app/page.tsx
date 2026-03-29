import { Metadata } from "next";
import StoryWritingAppClient from "./StoryWritingAppClient";

export const metadata: Metadata = {
  title: "Best Writing App for Novel Writers | Free Story Writing App | FlipScript",
  description: "Looking for the best writing app for novel writers? FlipScript is a free story writing app designed for authors who value focus and immersion. Join FlipScript today.",
  keywords: ["story writing app free", "best writing app for novel writers", "online story writing tool", "creative writing platform"]
};

export default function StoryWritingAppPage() {
  return <StoryWritingAppClient />;
}
