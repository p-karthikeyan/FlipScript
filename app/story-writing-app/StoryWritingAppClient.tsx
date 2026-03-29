'use client';

import { SEOLandingTemplate } from "@/components/SEOLandingTemplate";

export default function StoryWritingAppClient() {
  return (
    <SEOLandingTemplate
      heroBadge="The New Standard for Authors"
      heroTitle={(
        <>
          The Most Immersive <br />
          <span className="text-amber-500/60">Story Writing App.</span>
        </>
      )}
      heroSubtitle="Stop wrestling with formatting and start focusing on your plot. FlipScript is the story writing app free of distractions and built for modern authors."
      ctaText="Launch Your Story"
      keywords={[
        "story writing app free",
        "best writing app for novel writers",
        "online story writing tool",
        "book writing software online",
        "creative writing platform"
      ]}
      contentSections={[
        {
          title: "The Best Writing App for Novel Writers",
          content: (
            <div className="space-y-6">
              <p>Novelists require a special kind of focus. The journey from the first word to the final chapter is long and arduous. FlipScript was designed by writers, for writers, making it the <b>best writing app for novel writers</b> who value simplicity and immersion.</p>
              <p>Our interface mimics the physical presence of a book, giving you a sense of progress that no spreadsheet or linear document can provide. As you fill your digital manifold, you'll feel the weight of your story grow—a tactile feedback loop that keeps you motivated through the middle-of-the-book slump.</p>
            </div>
          )
        },
        {
          title: "A Story Writing App Free of Distractions",
          content: (
            <div className="space-y-6">
              <p>In a world of notifications and tab-switching, finding a quiet place to write is nearly impossible. FlipScript creates a <b>story writing app free</b> of unnecessary buttons, menus, and sidebars. When you enter our editor, everything else fades away.</p>
              <p>The minimal UI is designed to stay out of your way. We use subtle animations and transitions to create a "flow state" environment, helping you sink deeper into your world and stay there longer.</p>
            </div>
          )
        },
        {
          title: "Collaborative and Secure",
          content: (
            <div className="space-y-6">
              <p>While writing is often a solitary act, the journey to publication isn't. FlipScript's internal engine is built on robust secure storage, allowing you to share your manuscript safely when the time is right. Your creative property is protected by the same security standards used by major financial institutions.</p>
              <p>With our unique "shareId" system, you can provide read-only access to beta readers or editors without risking your master manuscript. They'll experience your book exactly as you intended—one beautiful page flip at a time.</p>
            </div>
          )
        }
      ]}
    />
  );
}
