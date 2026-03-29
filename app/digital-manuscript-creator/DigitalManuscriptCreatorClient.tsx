'use client';

import { SEOLandingTemplate } from "@/components/SEOLandingTemplate";

export default function DigitalManuscriptCreatorClient() {
  return (
    <SEOLandingTemplate
      heroBadge="Niche Professional Tools"
      heroTitle={(
        <>
          Your Future <br />
          <span className="text-amber-500/60">Digital Manuscript.</span>
        </>
      )}
      heroSubtitle="FlipScript is the digital manuscript creator that respects the craft of storytelling. From the first word to the final draft, we treat your book as a living entity."
      ctaText="Create Your Manuscript"
      keywords={[
        "digital manuscript creator",
        "digital hand-written book online",
        "online story writing tool free",
        "write books online with autosave",
        "immersive flip book creator free"
      ]}
      contentSections={[
        {
          title: "The Most Responsive Digital Manuscript Creator",
          content: (
            <div className="space-y-6">
              <p>For authors who want more than a text file, FlipScript's <b>digital manuscript creator</b> engine is the answer. We go beyond simple word count. We track the flow and structure of your book, presenting it to you in a way that truly feels finished, even when you're still in the first draft.</p>
              <p>The beauty of a digital manuscript is its permanence and portability. Access your book from any device and find it exactly as you left it—one beautiful, crisp page after another.</p>
            </div>
          )
        },
        {
          title: "Digital Hand-Written Book Online",
          content: (
            <div className="space-y-6">
              <p>FlipScript is more than an editor; it's an experience. We've spent countless hours perfecting the physics of the <b>digital hand-written book online</b>. Every page flip, every subtle shadow, and even the "weight" of the paper is designed to ground you in your work.</p>
              <p>This tactile feedback isn't just for show—it's functional. It helps writers maintain a mental map of their story, making it easier to return to specific sections and maintain a consistent tone throughout the manuscript.</p>
            </div>
          )
        },
        {
          title: "Secure Writing for Professionals",
          content: (
            <div className="space-y-6">
              <p>Professional writers need more than basic storage. They need a "Vault." Every book in FlipScript is encrypted and stored in a high-availability MongoDB database. This means no single-point-of-failure and zero chance of data loss due to hardware issues.</p>
              <p>Your creativity is your livelihood. We treat it with the respect it deserves, providing a <b>digital manuscript creator</b> that is as robust and reliable as it is beautiful.</p>
            </div>
          )
        }
      ]}
    />
  );
}
