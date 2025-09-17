import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load existing ideas
const ideasPath = path.join(__dirname, "src/assets/ideas.json");
const existingIdeas = JSON.parse(fs.readFileSync(ideasPath, "utf8"));

// Sample data for generating ideas
const ideaTitles = [
    "Enhanced Search Functionality",
    "Mobile App Development",
    "API Rate Limiting",
    "Dashboard Customization",
    "Export to Excel Feature",
    "Bulk Operations Support",
    "Email Notification System",
    "User Activity Tracking",
    "Advanced Filtering Options",
    "Keyboard Shortcuts",
    "Dark Mode Toggle",
    "Performance Optimization",
    "Caching Strategy",
    "Database Migration Tool",
    "Automated Testing Suite",
    "CI/CD Pipeline Setup",
    "Documentation Generator",
    "Code Review Workflow",
    "Security Audit Tool",
    "Backup and Recovery System",
    "Multi-language Support",
    "Accessibility Improvements",
    "Real-time Collaboration",
    "Version Control Integration",
    "Analytics Dashboard",
    "Customer Support Portal",
    "Payment Gateway Integration",
    "Social Media Sharing",
    "Push Notifications",
    "Offline Mode Support",
    "Data Visualization Tools",
    "Report Generation System",
    "User Onboarding Flow",
    "Password Reset Feature",
    "Two-Factor Authentication",
    "Session Management",
    "Error Logging System",
    "Performance Monitoring",
    "Load Balancing Solution",
    "Microservices Architecture",
    "GraphQL Implementation",
    "WebSocket Support",
    "File Upload System",
    "Image Optimization",
    "Video Streaming Feature",
    "Calendar Integration",
    "Map Integration",
    "Chat System",
    "Forum Feature",
    "Rating and Review System",
];

const categories = [
    "UI",
    "Platform",
    "Performance",
    "Security",
    "Integrations",
];
const tags = [
    ["feature", "enhancement"],
    ["bug-fix", "critical"],
    ["performance", "optimization"],
    ["security", "urgent"],
    ["ux", "design"],
    ["api", "integration"],
    ["mobile", "responsive"],
    ["accessibility", "a11y"],
    ["documentation", "help"],
    ["testing", "qa"],
];

const names = [
    "Sarah Johnson",
    "Mike Chen",
    "Emma Williams",
    "James Rodriguez",
    "Lisa Anderson",
    "David Kim",
    "Maria Garcia",
    "John Smith",
    "Amy Zhang",
    "Robert Brown",
    "Jennifer Lee",
    "Chris Martinez",
    "Nicole Davis",
    "Kevin Wilson",
    "Rachel Taylor",
    "Tom Miller",
    "Jessica Moore",
    "Brian Jackson",
    "Laura White",
    "Steven Harris",
    "Ashley Thompson",
    "Daniel Clark",
    "Michelle Lewis",
    "Jason Walker",
    "Karen Hall",
];

// Generate 250 random ideas
const newIdeas = [];
const now = new Date();
const startDate = new Date();
startDate.setDate(now.getDate() - 180); // 180 days ago

for (let i = 0; i < 250; i++) {
    // Random date within the last 180 days
    const randomDays = Math.floor(Math.random() * 180);
    const createdDate = new Date();
    createdDate.setDate(now.getDate() - randomDays);
    createdDate.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 60)
    );

    // Random target date (30-180 days from creation)
    const targetDate = new Date(createdDate);
    targetDate.setDate(
        targetDate.getDate() + Math.floor(Math.random() * 150) + 30
    );

    // Generate unique ID
    const idNum = existingIdeas.length + i + 1;
    const category = categories[Math.floor(Math.random() * categories.length)];
    const id = `${category.toLowerCase()}-${String(idNum).padStart(3, "0")}`;

    // Random title (with possible variations)
    const baseTitle = ideaTitles[Math.floor(Math.random() * ideaTitles.length)];
    const variation =
        Math.random() > 0.7 ? ` v${Math.floor(Math.random() * 3) + 2}` : "";
    const title = baseTitle + variation;

    // Random description
    const descriptions = [
        `Implementation of ${baseTitle.toLowerCase()} to improve user experience and system efficiency.`,
        `Add support for ${baseTitle.toLowerCase()} with comprehensive testing and documentation.`,
        `Enhance the system with ${baseTitle.toLowerCase()} capabilities for better performance.`,
        `Develop ${baseTitle.toLowerCase()} feature based on user feedback and requirements.`,
        `Integrate ${baseTitle.toLowerCase()} to streamline workflow and increase productivity.`,
    ];

    // Weight older ideas towards implemented, newer towards active
    const daysOld = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    let status;
    if (daysOld > 120) {
        // Older ideas more likely to be implemented
        const rand = Math.random();
        status =
            rand < 0.6
                ? "Implemented"
                : rand < 0.85
                  ? "Under Review"
                  : "Active";
    } else if (daysOld > 60) {
        // Medium age ideas
        const rand = Math.random();
        status =
            rand < 0.3 ? "Implemented" : rand < 0.6 ? "Under Review" : "Active";
    } else {
        // Newer ideas more likely to be active
        const rand = Math.random();
        status =
            rand < 0.1 ? "Implemented" : rand < 0.3 ? "Under Review" : "Active";
    }

    // Random votes (implemented ideas tend to have more votes)
    let votes;
    if (status === "Implemented") {
        votes = Math.floor(Math.random() * 80) + 20; // 20-100
    } else if (status === "Under Review") {
        votes = Math.floor(Math.random() * 50) + 10; // 10-60
    } else {
        votes = Math.floor(Math.random() * 30); // 0-30
    }

    const idea = {
        id: id,
        title: title,
        description:
            descriptions[Math.floor(Math.random() * descriptions.length)],
        category: category,
        status: status,
        votes: votes,
        tags: tags[Math.floor(Math.random() * tags.length)],
        requesterName: names[Math.floor(Math.random() * names.length)],
        requesterEmail: `${names[Math.floor(Math.random() * names.length)].toLowerCase().replace(" ", ".")}@example.com`,
        targetDate: targetDate.toISOString().split("T")[0],
        createdAt: createdDate.toISOString(),
    };

    newIdeas.push(idea);
}

// Combine with existing ideas and sort by date
const allIdeas = [...existingIdeas, ...newIdeas].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);

// Write back to file
fs.writeFileSync(ideasPath, JSON.stringify(allIdeas, null, 4));

console.log(`Successfully added ${newIdeas.length} new ideas!`);
console.log(`Total ideas: ${allIdeas.length}`);

// Show distribution summary
const distribution = {};
newIdeas.forEach((idea) => {
    const date = new Date(idea.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    distribution[monthKey] = (distribution[monthKey] || 0) + 1;
});

console.log("\nDistribution by month:");
Object.entries(distribution)
    .sort()
    .forEach(([month, count]) => {
        console.log(`  ${month}: ${count} ideas`);
    });

console.log("\nStatus distribution:");
const statusCount = {};
newIdeas.forEach((idea) => {
    statusCount[idea.status] = (statusCount[idea.status] || 0) + 1;
});
Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} ideas`);
});
