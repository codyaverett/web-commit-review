// Generate 100 more creative and humorous ideas
import fs from "fs";

// Read existing ideas
const existingIdeas = JSON.parse(
    fs.readFileSync("./src/assets/ideas.json", "utf8")
);

// Get the last ID number
const lastId = Math.max(
    ...existingIdeas.map((i) => parseInt(i.id.split("-")[1]))
);

// Categories
const categories = [
    "UI",
    "Platform",
    "Integrations",
    "Performance",
    "Security",
];

// Statuses
const statuses = ["Active", "Under Review", "Implemented", "Active", "Active"]; // More active ones

// Names for requesters
const firstNames = [
    "Oliver",
    "Sophia",
    "Liam",
    "Emma",
    "Noah",
    "Ava",
    "Ethan",
    "Isabella",
    "Mason",
    "Mia",
    "Lucas",
    "Charlotte",
    "Alexander",
    "Amelia",
    "Daniel",
    "Harper",
    "Matthew",
    "Evelyn",
    "Joseph",
    "Abigail",
    "Samuel",
    "Emily",
    "Benjamin",
    "Madison",
    "Jacob",
    "Chloe",
    "William",
    "Victoria",
    "Michael",
    "Grace",
    "Elijah",
    "Zoey",
    "James",
    "Lily",
    "Ryan",
    "Hannah",
    "Jordan",
    "Natalie",
    "Tyler",
    "Zoe",
];
const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Anderson",
    "Taylor",
    "Thomas",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Walker",
    "Hall",
    "Allen",
    "Young",
    "King",
    "Wright",
    "Lopez",
    "Hill",
    "Scott",
    "Green",
    "Adams",
    "Baker",
    "Nelson",
];

// Creative idea templates with various levels of humor
const ideaTemplates = [
    // Serious but clever
    {
        title: "AI-Powered Code Reviews",
        description:
            "Implement Claude to automatically review PRs and suggest improvements with sarcastic comments when appropriate.",
        tags: ["ai", "automation", "code-review"],
    },
    {
        title: "Quantum Encryption",
        description:
            "Use quantum computing principles for encryption. Just kidding, use AES-256 like everyone else.",
        tags: ["security", "encryption", "quantum"],
    },
    {
        title: "Blockchain Everything",
        description:
            "Add blockchain to track idea submissions because apparently everything needs blockchain now.",
        tags: ["blockchain", "trending", "web3"],
    },
    {
        title: "Voice-Activated Commands",
        description:
            "Control the app by yelling at your computer. Finally, a legitimate reason to shout at your screen.",
        tags: ["voice", "accessibility", "ai"],
    },
    {
        title: "Emoji-Only Mode",
        description:
            "Replace all text with emojis for international compatibility. 🌍💻✨",
        tags: ["i18n", "emoji", "ux"],
    },

    // Developer humor
    {
        title: "Automatic Coffee Ordering",
        description:
            "Detect when a developer is debugging and automatically order coffee delivery.",
        tags: ["integration", "productivity", "coffee"],
    },
    {
        title: "Rubber Duck Debugger",
        description:
            "Virtual rubber duck that listens to your code problems and nods sympathetically.",
        tags: ["debugging", "ai", "mental-health"],
    },
    {
        title: "Stack Overflow Integration",
        description:
            "Automatically search Stack Overflow when errors occur. Copy-paste solutions with attribution.",
        tags: ["integration", "debugging", "productivity"],
    },
    {
        title: "Git Blame Shield",
        description:
            "Automatically redirect git blame to a fictional developer named 'Not Me'.",
        tags: ["git", "humor", "tools"],
    },
    {
        title: "Meeting Escape Button",
        description:
            "Emergency button that creates a fake production issue to escape from meetings.",
        tags: ["productivity", "meetings", "emergency"],
    },

    // Productivity features
    {
        title: "Procrastination Tracker",
        description:
            "Track time spent on Reddit and YouTube, display it prominently to induce guilt.",
        tags: ["productivity", "tracking", "guilt"],
    },
    {
        title: "Deadline Panic Mode",
        description:
            "Automatically enable dark mode and play intense music as deadlines approach.",
        tags: ["productivity", "deadlines", "motivation"],
    },
    {
        title: "Code Complexity Shamer",
        description:
            "Publicly shame overly complex code with automated 'Why?' comments.",
        tags: ["code-quality", "automation", "shame"],
    },
    {
        title: "Weekend Deploy Blocker",
        description:
            "Prevent deployments on Fridays after 3 PM. Save your weekend, save your sanity.",
        tags: ["deployment", "safety", "work-life-balance"],
    },
    {
        title: "Bug Bounty Lottery",
        description:
            "Turn bug fixes into a lottery system. Fix a bug, win a prize!",
        tags: ["gamification", "bugs", "motivation"],
    },

    // UI/UX improvements
    {
        title: "Chaos Mode",
        description:
            "Randomly rearrange UI elements daily to keep users alert and engaged.",
        tags: ["ui", "chaos", "engagement"],
    },
    {
        title: "Retro Terminal Theme",
        description:
            "Green text on black background with CRT monitor effects. For the nostalgic developers.",
        tags: ["theme", "retro", "nostalgia"],
    },
    {
        title: "Comic Sans Mode",
        description:
            "Replace all fonts with Comic Sans for April Fools' Day. Or permanently, if you're evil.",
        tags: ["fonts", "humor", "evil"],
    },
    {
        title: "Matrix Rain Background",
        description:
            "Add falling green characters in the background. Increase productivity by 0%, coolness by 100%.",
        tags: ["theme", "matrix", "aesthetics"],
    },
    {
        title: "Clippy Assistant",
        description:
            "Bring back Clippy to help with form submissions. 'It looks like you're trying to submit an idea!'",
        tags: ["assistant", "nostalgia", "clippy"],
    },

    // Performance optimizations
    {
        title: "Infinite Scroll Loading",
        description:
            "Load content infinitely until the browser crashes. It's not a bug, it's a feature.",
        tags: ["performance", "scroll", "infinity"],
    },
    {
        title: "Aggressive Caching",
        description:
            "Cache everything forever. Storage is cheap, user patience is not.",
        tags: ["caching", "performance", "storage"],
    },
    {
        title: "Quantum Performance",
        description:
            "Make the app simultaneously fast and slow until observed by a user.",
        tags: ["performance", "quantum", "schrodinger"],
    },
    {
        title: "ML-Powered Loading",
        description:
            "Use machine learning to predict what users will click and preload everything.",
        tags: ["ml", "performance", "prediction"],
    },
    {
        title: "WebAssembly Everything",
        description:
            "Rewrite the entire frontend in Rust compiled to WebAssembly. Because we can.",
        tags: ["wasm", "rust", "performance"],
    },

    // Security features
    {
        title: "Biometric Everything",
        description:
            "Require fingerprint, face scan, and DNA sample to upvote an idea.",
        tags: ["security", "biometric", "overkill"],
    },
    {
        title: "Time-Travel Authentication",
        description:
            "Verify user identity by checking their future login attempts.",
        tags: ["security", "time-travel", "scifi"],
    },
    {
        title: "Captcha Boss Battle",
        description:
            "Replace captchas with increasingly difficult boss battles from Dark Souls.",
        tags: ["security", "captcha", "gaming"],
    },
    {
        title: "Password Haiku Mode",
        description:
            "Require passwords to be submitted as haikus for enhanced security and poetry.",
        tags: ["security", "password", "poetry"],
    },
    {
        title: "Security Theater Mode",
        description:
            "Add lots of spinning locks and vault doors animations that do nothing.",
        tags: ["security", "theater", "ux"],
    },

    // Integration ideas
    {
        title: "TikTok Integration",
        description:
            "Turn feature requests into 30-second dance videos. Most likes wins implementation.",
        tags: ["integration", "social", "tiktok"],
    },
    {
        title: "Spotify Mood Matching",
        description:
            "Suggest features based on user's current Spotify playlist mood.",
        tags: ["integration", "spotify", "mood"],
    },
    {
        title: "Weather-Based Features",
        description:
            "Enable different features based on local weather. Rainy day? Here's dark mode.",
        tags: ["integration", "weather", "dynamic"],
    },
    {
        title: "Astrology-Driven Development",
        description:
            "Only deploy when Mercury is not in retrograde. Blame the stars for bugs.",
        tags: ["astrology", "deployment", "blame"],
    },
    {
        title: "Pizza Tracker Integration",
        description:
            "Track feature development like pizza delivery. 'Your feature is in the oven!'",
        tags: ["integration", "pizza", "tracking"],
    },

    // Team collaboration
    {
        title: "Virtual High-Five System",
        description:
            "Send virtual high-fives to teammates. Collect them all for a real pizza party.",
        tags: ["collaboration", "gamification", "team"],
    },
    {
        title: "Code Review Karma",
        description:
            "Earn karma points for constructive code reviews. Lose points for nitpicking.",
        tags: ["collaboration", "karma", "review"],
    },
    {
        title: "Pair Programming Matchmaker",
        description:
            "AI-powered system to match developers for pair programming based on coffee preferences.",
        tags: ["collaboration", "ai", "pairing"],
    },
    {
        title: "Blame Distribution System",
        description:
            "Evenly distribute blame for bugs across the team. Socialism for software errors.",
        tags: ["collaboration", "blame", "equality"],
    },
    {
        title: "Virtual Water Cooler",
        description:
            "Mandatory 5-minute chat about non-work topics before accessing the app.",
        tags: ["collaboration", "social", "water-cooler"],
    },

    // Data visualization
    {
        title: "3D Holographic Charts",
        description:
            "Display data in 3D holograms. Requires $50,000 hologram projector not included.",
        tags: ["visualization", "3d", "expensive"],
    },
    {
        title: "Interpretive Dance Analytics",
        description:
            "Convert data trends into interpretive dance performances by animated stick figures.",
        tags: ["analytics", "dance", "visualization"],
    },
    {
        title: "Mood Ring Dashboard",
        description:
            "Dashboard changes colors based on the collective mood of all users.",
        tags: ["dashboard", "mood", "colors"],
    },
    {
        title: "ASCII Art Reports",
        description:
            "Generate all reports in beautiful ASCII art. Printing friendly since 1963.",
        tags: ["reports", "ascii", "retro"],
    },
    {
        title: "VR Data Exploration",
        description:
            "Navigate through your data in a Tron-like virtual world. Includes motion sickness.",
        tags: ["vr", "data", "tron"],
    },

    // Miscellaneous creative ideas
    {
        title: "Konami Code Easter Egg",
        description:
            "Add secret features unlocked by the Konami code. ↑↑↓↓←→←→BA",
        tags: ["easter-egg", "gaming", "konami"],
    },
    {
        title: "Dad Joke Generator",
        description:
            "Automatically generate dad jokes in error messages. 'Error 404: Page not found... just like my keys!'",
        tags: ["humor", "dad-jokes", "errors"],
    },
    {
        title: "Motivational Push Notifications",
        description:
            "Send hourly motivational quotes. 'You miss 100% of the commits you don't push' - Wayne Gretzky",
        tags: ["notifications", "motivation", "quotes"],
    },
    {
        title: "Office Pet Integration",
        description:
            "Virtual office pet that grows based on team productivity. Don't let it starve!",
        tags: ["gamification", "pets", "productivity"],
    },
    {
        title: "Zen Mode",
        description:
            "Replace all UI with a single breathing exercise animation. Features can wait.",
        tags: ["wellness", "zen", "mindfulness"],
    },

    // More serious but creative
    {
        title: "Predictive Issue Detection",
        description:
            "AI system that predicts bugs before they happen. Minority Report for software.",
        tags: ["ai", "prediction", "bugs"],
    },
    {
        title: "Carbon Footprint Tracker",
        description:
            "Track the environmental impact of running the application. Plant trees to offset.",
        tags: ["environment", "tracking", "green"],
    },
    {
        title: "Accessibility Audit Bot",
        description:
            "Automated bot that continuously checks and reports accessibility issues.",
        tags: ["accessibility", "automation", "audit"],
    },
    {
        title: "Smart Resource Allocation",
        description:
            "AI-driven system to automatically allocate server resources based on usage patterns.",
        tags: ["ai", "resources", "optimization"],
    },
    {
        title: "Universal Translation",
        description:
            "Real-time translation for all content into 100+ languages using AI.",
        tags: ["i18n", "translation", "ai"],
    },

    // Developer tools
    {
        title: "Time Machine Debugger",
        description:
            "Debug code by traveling back in time to when it worked. Requires flux capacitor.",
        tags: ["debugging", "time-travel", "tools"],
    },
    {
        title: "Sarcasm Linter",
        description:
            "Linter that adds sarcastic comments to bad code. 'Oh great, another nested ternary.'",
        tags: ["linting", "sarcasm", "code-quality"],
    },
    {
        title: "YOLO Deploy Mode",
        description:
            "Skip all tests and deploy directly to production. What could go wrong?",
        tags: ["deployment", "yolo", "danger"],
    },
    {
        title: "Imposter Syndrome Helper",
        description:
            "Reassuring messages when you google basic syntax for the 100th time.",
        tags: ["mental-health", "support", "development"],
    },
    {
        title: "Rage Quit Handler",
        description:
            "Detect rage quits and automatically save work before the laptop gets thrown.",
        tags: ["safety", "anger-management", "autosave"],
    },

    // Future features
    {
        title: "Neural Link Integration",
        description:
            "Code directly with your thoughts. Bugs included in thinking process.",
        tags: ["neural", "future", "scifi"],
    },
    {
        title: "Teleportation API",
        description:
            "API endpoints for teleporting objects. Currently returns 501 Not Implemented.",
        tags: ["api", "teleportation", "future"],
    },
    {
        title: "Time Dilation Mode",
        description:
            "Slow down time during debugging sessions. One hour feels like one minute.",
        tags: ["time", "debugging", "physics"],
    },
    {
        title: "Parallel Universe Testing",
        description:
            "Test features in parallel universes where they already exist.",
        tags: ["testing", "multiverse", "scifi"],
    },
    {
        title: "Mind Reading UI",
        description:
            "UI that adapts based on what users are thinking. Privacy policy not included.",
        tags: ["ui", "mind-reading", "privacy"],
    },
];

// Generate random date between Jan 1, 2024 and today
function randomDate() {
    const start = new Date("2024-01-01");
    const end = new Date();
    const date = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
    return date.toISOString();
}

// Generate target date 1-6 months from created date
function targetDate(createdDate) {
    const created = new Date(createdDate);
    const months = Math.floor(Math.random() * 6) + 1;
    created.setMonth(created.getMonth() + months);
    return created.toISOString().split("T")[0];
}

// Generate random votes
function randomVotes() {
    // Most ideas have low votes, some medium, few high
    const rand = Math.random();
    if (rand < 0.6) return Math.floor(Math.random() * 15) + 1;
    if (rand < 0.9) return Math.floor(Math.random() * 30) + 15;
    return Math.floor(Math.random() * 50) + 30;
}

// Generate new ideas
const newIdeas = [];
const usedTemplates = new Set();

for (let i = 0; i < 100; i++) {
    // Pick a random template (try not to repeat)
    let templateIndex;
    let template;
    let attempts = 0;

    do {
        templateIndex = Math.floor(Math.random() * ideaTemplates.length);
        template = ideaTemplates[templateIndex];
        attempts++;
    } while (usedTemplates.has(templateIndex) && attempts < 10);

    usedTemplates.add(templateIndex);

    // If we've used all templates, allow repeats with variations
    if (usedTemplates.size >= ideaTemplates.length) {
        usedTemplates.clear();
    }

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const created = randomDate();
    const category = categories[Math.floor(Math.random() * categories.length)];

    // Add some variety to repeated templates
    const suffix =
        usedTemplates.size > ideaTemplates.length / 2
            ? ` v${Math.floor(Math.random() * 3) + 2}`
            : "";

    newIdeas.push({
        id: `i-${lastId + i + 1}`,
        title: template.title + suffix,
        description: template.description,
        category: category,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        votes: randomVotes(),
        tags: template.tags,
        requesterName: `${firstName} ${lastName}`,
        requesterEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        targetDate: targetDate(created),
        createdAt: created,
    });
}

// Combine with existing ideas
const allIdeas = [...existingIdeas, ...newIdeas];

// Sort by date (newest first)
allIdeas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

// Write back to file
fs.writeFileSync("./src/assets/ideas.json", JSON.stringify(allIdeas, null, 4));

console.log(`Generated ${newIdeas.length} new ideas!`);
console.log(`Total ideas: ${allIdeas.length}`);
