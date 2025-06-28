import { db } from "./db";
import { 
  users, 
  educationalLessons, 
  greyRockScenarios, 
  boundaryTemplates 
} from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");

  // Create default user if not exists
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    await db.insert(users).values({
      username: "user",
      password: "password"
    });
    console.log("✓ Created default user");
  }

  // Seed educational lessons
  const existingLessons = await db.select().from(educationalLessons);
  if (existingLessons.length === 0) {
    await db.insert(educationalLessons).values([
      {
        title: "Understanding Gaslighting",
        content: "Gaslighting is a form of psychological manipulation where someone makes you question your own reality, memories, or perceptions. It's a common tactic used by narcissists and abusers to maintain control.\n\nCommon gaslighting phrases include:\n- 'That never happened'\n- 'You're being too sensitive'\n- 'You're imagining things'\n- 'You're crazy'\n\nRecognizing gaslighting is the first step to protecting yourself from it.",
        category: "narcissistic-abuse",
        difficulty: "beginner",
        duration: 5,
        tags: ["gaslighting", "manipulation", "abuse"],
        keyTakeaways: [
          "Gaslighting makes you question your reality",
          "It's a deliberate manipulation tactic",
          "Trust your instincts and memories",
          "Document incidents to maintain clarity"
        ]
      },
      {
        title: "Love-Bombing and Idealization",
        content: "Love-bombing is an overwhelming display of affection and attention used to manipulate someone into a relationship or maintain control. It's often followed by devaluation and discard.\n\nSigns of love-bombing:\n- Excessive gifts and attention early in the relationship\n- Constant texting and calling\n- Rushing the relationship timeline\n- Making you feel 'special' or 'unique'\n\nHealthy relationships develop gradually with consistent, balanced affection.",
        category: "narcissistic-abuse", 
        difficulty: "beginner",
        duration: 7,
        tags: ["love-bombing", "manipulation", "relationships"],
        keyTakeaways: [
          "Love-bombing is excessive early affection",
          "It's used to create dependency",
          "Healthy love grows gradually",
          "Watch for rushed relationship timelines"
        ]
      },
      {
        title: "Breaking Trauma Bonds",
        content: "Trauma bonds form when you experience intense emotional connections with someone who causes you pain. These bonds can make it difficult to leave abusive relationships.\n\nTrauma bonds develop through:\n- Intermittent reinforcement (unpredictable rewards)\n- Isolation from support systems\n- Emotional dependency\n- Fear of abandonment\n\nBreaking trauma bonds requires professional support, building self-worth, and creating new, healthy relationships.",
        category: "trauma-bonds",
        difficulty: "intermediate", 
        duration: 10,
        tags: ["trauma-bonds", "healing", "therapy"],
        keyTakeaways: [
          "Trauma bonds create addictive attachment",
          "They form through intermittent reinforcement",
          "Professional help is often necessary",
          "Building self-worth is crucial for healing"
        ]
      },
      {
        title: "Triangulation Tactics",
        content: "Triangulation involves bringing a third person into your relationship dynamic to create jealousy, insecurity, or competition. It's a manipulation tactic designed to keep you fighting for attention.\n\nForms of triangulation:\n- Comparing you to exes or other people\n- Flirting with others in front of you\n- Using children as weapons\n- Playing people against each other\n\nHealthy relationships don't involve manipulative third parties or constant comparisons.",
        category: "manipulation-tactics",
        difficulty: "intermediate",
        duration: 8,
        tags: ["triangulation", "manipulation", "jealousy"],
        keyTakeaways: [
          "Triangulation involves bringing third parties into conflicts",
          "It creates artificial competition and jealousy",
          "Healthy relationships are between two people",
          "Don't compete for someone's basic respect"
        ]
      }
    ]);
    console.log("✓ Seeded educational lessons");
  }

  // Seed Grey Rock scenarios
  const existingScenarios = await db.select().from(greyRockScenarios);
  if (existingScenarios.length === 0) {
    await db.insert(greyRockScenarios).values([
      {
        title: "Workplace Criticism",
        description: "A colleague constantly criticizes your work in front of others and tries to provoke an emotional response.",
        provocativeMessage: "Wow, you really messed up that presentation. I'm not sure how you got this job in the first place.",
        difficulty: "beginner",
        category: "work",
        goodResponses: [
          "I'll review the feedback and make improvements where needed.",
          "Thanks for the input.",
          "I'll take that into consideration."
        ],
        badResponses: [
          "That's not fair! I worked really hard on that!",
          "You're just jealous of my success!",
          "I can't believe you'd say that to me!"
        ],
        tips: [
          "Keep your voice neutral and monotone",
          "Don't defend yourself or get emotional",
          "Give minimal, factual responses",
          "Avoid eye contact and body language that shows engagement"
        ]
      },
      {
        title: "Family Guilt Trip",
        description: "A family member tries to manipulate you with guilt and demands an emotional reaction.",
        provocativeMessage: "You never call anymore. I guess you don't care about your family. Your siblings would never treat me this way.",
        difficulty: "beginner", 
        category: "family",
        goodResponses: [
          "I call when I can. I'll talk to you later.",
          "Okay.",
          "I understand you're upset."
        ],
        badResponses: [
          "That's not true! I do care!",
          "My siblings don't have as much going on as I do!",
          "You're being unfair and manipulative!"
        ],
        tips: [
          "Don't justify your actions",
          "Avoid JADE (Justify, Argue, Defend, Explain)",
          "Keep responses brief and factual",
          "Don't take the bait about comparisons"
        ]
      },
      {
        title: "Ex-Partner Drama",
        description: "An ex-partner tries to create conflict about past relationship issues during a necessary interaction.",
        provocativeMessage: "I can't believe you're still acting like the victim. You know what you did to me. You ruined everything between us.",
        difficulty: "advanced",
        category: "ex-partner",
        goodResponses: [
          "I need to focus on the current matter. Let's discuss the logistics.",
          "We need to keep this about [current topic].",
          "I'm not discussing the past."
        ],
        badResponses: [
          "I wasn't the problem in our relationship!",
          "You're the one who ruined everything!",
          "How dare you say that to me!"
        ],
        tips: [
          "Redirect to practical matters only",
          "Don't engage with emotional accusations",
          "Set clear boundaries about topics",
          "Document interactions if necessary"
        ]
      }
    ]);
    console.log("✓ Seeded Grey Rock scenarios");
  }

  // Seed boundary templates
  const existingTemplates = await db.select().from(boundaryTemplates);
  if (existingTemplates.length === 0) {
    await db.insert(boundaryTemplates).values([
      {
        title: "Respectful Communication",
        category: "emotional",
        template: "I will not engage in conversations where I'm being yelled at, insulted, or spoken to disrespectfully. If this continues, I will end the conversation.",
        example: "I don't accept being called names. Please speak to me respectfully, or I'll end this conversation.",
        difficulty: "easy",
        tags: ["communication", "respect", "verbal-abuse"]
      },
      {
        title: "Physical Boundaries", 
        category: "physical",
        template: "I have the right to personal space and physical comfort. I do not consent to unwanted physical contact or invasion of my personal space.",
        example: "Please don't touch me without asking first. I need you to respect my personal space.",
        difficulty: "easy",
        tags: ["physical", "personal-space", "consent"]
      },
      {
        title: "Time and Availability",
        category: "personal",
        template: "My time is valuable. I will not be available for last-minute demands or guilt trips about how I spend my free time.",
        example: "I'm not available for calls after 9 PM. Please respect my schedule and plan ahead.",
        difficulty: "moderate",
        tags: ["time", "availability", "schedule"]
      },
      {
        title: "Emotional Responsibility",
        category: "emotional",
        template: "I am not responsible for managing your emotions or reactions. I will not accept blame for your feelings or be guilted into changing my behavior to manage your emotions.",
        example: "Your reaction to my decision is not my responsibility. I won't change my boundaries to manage your emotions.",
        difficulty: "challenging",
        tags: ["emotional", "responsibility", "guilt-trips"]
      },
      {
        title: "Financial Independence",
        category: "financial",
        template: "I have the right to make my own financial decisions. I will not be pressured, guilted, or manipulated into financial arrangements that make me uncomfortable.",
        example: "I won't lend money without a clear repayment plan. My financial decisions are not up for debate.",
        difficulty: "moderate",
        tags: ["financial", "money", "independence"]
      }
    ]);
    console.log("✓ Seeded boundary templates");
  }

  console.log("Database seeding complete!");
}

// Run if called directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };