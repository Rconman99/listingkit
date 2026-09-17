import { PropertyInput, GenerationResult } from '../lib/types';

export const SAMPLE_PROPERTY: PropertyInput = {
  address: '123 Maple Drive',
  city: 'Denver',
  state: 'CO',
  zip: '80220',
  propertyType: 'Single Family',
  bedrooms: '4',
  bathrooms: '3',
  squareFootage: '2,450',
  lotSize: '0.18 acres',
  yearBuilt: '2018',
  listPrice: '625000',
  mlsCharLimit: '',
  keyFeatures: 'Open-concept kitchen with quartz countertops, hardwood floors throughout, covered patio with mountain views, finished basement with wet bar',
  recentUpgrades: 'New smart home system 2024, designer landscaping with drip irrigation',
  neighborhoodHighlights: 'Minutes from Cherry Creek Trail, top-rated schools, direct access to downtown Denver',
  tone: 'Professional',
  agentName: 'Sarah Mitchell',
  brokerageName: 'Front Range Realty',
};

export const SAMPLE_RESULTS: GenerationResult = {
  distribution: {
    status: 'success',
    assets: {
      property_page: {
        headline: '123 Maple Drive · Denver',
        summary: '4 bedrooms, 3 bathrooms and 2,450 square feet, listed at $625,000. Features include an open-concept kitchen with quartz countertops, hardwood floors, a finished basement with wet bar, and a covered patio with mountain views.',
        seo_title: '123 Maple Drive, Denver CO | 4-Bedroom Home',
        meta_description: 'Explore 123 Maple Drive in Denver: 4 bedrooms, 3 bathrooms, 2,450 SF, and a covered patio with mountain views. Listed at $625,000.',
      },
      agent_email: {
        subject: 'Listing introduction: 123 Maple Drive, Denver',
        body: 'Sharing 123 Maple Drive in Denver, CO 80220, listed at $625,000. This 2018 home includes 4 bedrooms, 3 bathrooms, 2,450 square feet, a finished basement with wet bar, and a covered patio with mountain views. Reply to discuss the property. Sarah Mitchell | Front Range Realty',
      },
      youtube_description: 'Explore the public listing facts for 123 Maple Drive in Denver: 4 bedrooms, 3 bathrooms, 2,450 square feet, built in 2018. Features include quartz countertops, hardwood floors, and a covered patio with mountain views. Listed at $625,000 by Sarah Mitchell, Front Range Realty.',
      google_business_post: '123 Maple Drive, Denver, CO 80220: 4 bedrooms, 3 bathrooms and 2,450 square feet, listed at $625,000. Features include an open-concept kitchen with quartz countertops and a finished basement with wet bar. Sarah Mitchell | Front Range Realty.',
    },
  },
  mls: {
    status: 'success',
    text: `This stunning 4-bedroom, 3-bathroom home at 123 Maple Drive delivers modern living at its finest with 2,450 square feet of thoughtfully designed space. Step inside to discover an open-concept kitchen featuring quartz countertops and seamless flow into sun-drenched living areas, all complemented by hardwood floors throughout.

The finished basement offers a versatile retreat complete with a wet bar — ideal for entertaining or relaxing after a long day. Upstairs, the spacious primary suite presents a private sanctuary with generous closet space and an en-suite bath.

Step outside to the covered patio where panoramic mountain views set the backdrop for every morning coffee and evening gathering. The professionally landscaped yard features a smart drip irrigation system, keeping maintenance effortless year-round.

Built in 2018, this home includes a newly installed smart home system (2024) that puts lighting, climate, and security at your fingertips. Located minutes from Cherry Creek Trail with direct access to downtown Denver and top-rated schools, 123 Maple Drive offers the perfect blend of modern comfort and unbeatable location.

Don't miss your opportunity to own this exceptional property. Schedule your private showing today.

Listed by Sarah Mitchell, Front Range Realty`,
  },
  social: {
    status: 'success',
    posts: {
      instagram: `🏡 Just hit the market and it won't last long.

123 Maple Drive in Denver is everything you've been searching for — 4 beds, 3 baths, 2,450 SF of open-concept living with mountain views from the covered patio. ⛰️

✨ Quartz countertops & hardwood floors throughout
🍷 Finished basement with wet bar
🌿 Designer landscaping with smart irrigation
📱 Full smart home system installed 2024

💰 $625,000 | Built 2018

This one checks every box. DM for details or to schedule a private showing! 📩

#DenverRealEstate #JustListed #DenverHomes #MountainViews #OpenConcept #CherryCreek #Colorado #DenverLiving #MileHighCity #HomeForSale`,

      facebook: `Exciting new listing alert! 🏠

123 Maple Drive just hit the market in Denver, and this one is special. 4 bedrooms, 3 bathrooms, 2,450 square feet — and the mountain views from the covered patio are absolutely incredible.

The open-concept kitchen features gorgeous quartz countertops with hardwood floors flowing throughout the main level. Downstairs, the finished basement includes a wet bar that's ready for game days and gatherings.

Built in 2018, the home also includes a brand-new smart home system installed this year and professionally designed landscaping with drip irrigation — so the curb appeal maintains itself.

Located minutes from Cherry Creek Trail with easy access to downtown Denver and top-rated schools.

$625,000 | 4 BD | 3 BA | 2,450 SF

Know someone looking for their next home in Denver? Tag them below! 👇

Sarah Mitchell | Front Range Realty`,

      linkedin: `Thrilled to bring 123 Maple Drive to market in Denver's highly sought-after 80220 corridor.

This 4-bedroom, 3-bathroom residence offers 2,450 square feet of modern design built in 2018 — a sweet spot in today's market where buyers increasingly value newer construction with established neighborhoods. Denver's median home price continues to reflect strong demand in areas with trail access and top-rated schools, and this property delivers on both fronts.

Key highlights include an open-concept kitchen with quartz countertops, hardwood floors throughout, a finished basement with wet bar, and a covered patio showcasing mountain views. The home also features a 2024 smart home system upgrade and designer landscaping with drip irrigation.

Listed at $625,000, this property represents strong value in a market where quality inventory remains limited.

Reach out if you or anyone in your network is looking in Denver — happy to arrange a private showing or provide a detailed market analysis for the area.

Sarah Mitchell | Front Range Realty`,
    },
  },
  email: {
    status: 'success',
    parsed: {
      subject: 'Just Listed: Stunning 4-Bed in Denver with Mountain Views',
      body: `Hi there,

I wanted to make sure you saw this before it hits the weekend rush — 123 Maple Drive just came on the market and it's one of the strongest listings I've seen this season.

Here's what makes it stand out:

1. Open-concept kitchen with quartz countertops and hardwood floors throughout — the kind of flow that makes you stop in the doorway
2. A finished basement with a wet bar — ready for entertaining from day one
3. Covered patio with panoramic mountain views that you have to see in person

Property Snapshot:
📍 123 Maple Drive, Denver, CO
💰 $625,000
🏠 4 BD | 3 BA | 2,450 SF

Built in 2018 with a brand-new smart home system and designer landscaping — this home is move-in ready with modern touches throughout.

Properties like this in Denver don't sit long. Reply to schedule a showing before this weekend — I have availability Thursday and Friday afternoon.

Best,
Sarah Mitchell
Front Range Realty`,
    },
    raw: `SUBJECT: Just Listed: Stunning 4-Bed in Denver with Mountain Views
---
Hi there,

I wanted to make sure you saw this before it hits the weekend rush — 123 Maple Drive just came on the market and it's one of the strongest listings I've seen this season.

Here's what makes it stand out:

1. Open-concept kitchen with quartz countertops and hardwood floors throughout — the kind of flow that makes you stop in the doorway
2. A finished basement with a wet bar — ready for entertaining from day one
3. Covered patio with panoramic mountain views that you have to see in person

Property Snapshot:
📍 123 Maple Drive, Denver, CO
💰 $625,000
🏠 4 BD | 3 BA | 2,450 SF

Built in 2018 with a brand-new smart home system and designer landscaping — this home is move-in ready with modern touches throughout.

Properties like this in Denver don't sit long. Reply to schedule a showing before this weekend — I have availability Thursday and Friday afternoon.

Best,
Sarah Mitchell
Front Range Realty`,
  },
  flyer: {
    status: 'success',
    text: `HEADLINE: Where Modern Living Meets Mountain Views
ADDRESS: 123 Maple Drive, Denver, CO 80220
PRICE: $625,000
SPECS: 4 BD | 3 BA | 2,450 SF
---
• Open-concept kitchen with premium quartz countertops
• Hardwood floors flowing throughout the main level
• Finished basement with built-in wet bar
• Covered patio with panoramic mountain views
• Full smart home system — lighting, climate & security
• Designer landscaping with automated drip irrigation
• Minutes from Cherry Creek Trail & downtown Denver
• Built 2018 — modern construction, established neighborhood
---
OPEN HOUSE: [DATE] | [TIME]
CONTACT: Sarah Mitchell | Front Range Realty | [PHONE]`,
  },
  video: {
    status: 'success',
    text: `[VISUAL: Slow drone pull-back revealing mountain views behind the home]
NARRATION: "Wait until you see this view from the back patio."

[VISUAL: Walk up the front path, showing landscaping and exterior]
NARRATION: "Welcome to 123 Maple Drive in Denver — a 2018 build sitting on just under a fifth of an acre with designer landscaping that practically takes care of itself."

[VISUAL: Open front door, wide shot of entryway flowing into living room]
NARRATION: "Right away you'll notice these hardwood floors running throughout the main level — and this open-concept layout that just pulls you in."

[VISUAL: Pan across kitchen showing quartz countertops and island]
NARRATION: "The kitchen is the heart of this home. Quartz countertops, tons of counter space, and a layout that makes cooking and hosting feel effortless."

[VISUAL: Walk into primary suite, show bathroom and closet]
NARRATION: "The primary suite gives you that retreat feel — spacious, private, with a full en-suite that doesn't cut corners."

[VISUAL: Head downstairs to finished basement, show wet bar]
NARRATION: "Downstairs, you've got a fully finished basement with a wet bar — game day, movie night, or just your own private hangout spot."

[VISUAL: Step out onto covered patio, camera reveals mountain view]
NARRATION: "And here it is — the covered patio with those mountain views. Morning coffee here just hits different."

[VISUAL: Agent on patio, turns to camera]
NARRATION: "123 Maple Drive — 4 beds, 3 baths, 2,450 square feet, listed at $625,000. I'm Sarah Mitchell with Front Range Realty — call me for a private showing."`,
  },
  generatedAt: '2025-01-15T10:30:00.000Z',
  property: SAMPLE_PROPERTY,
};
