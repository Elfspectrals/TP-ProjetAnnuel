"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/generated/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Starting database seeding...");
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    const user1 = await prisma.user.create({
        data: {
            email: "alice@example.com",
            name: "Alice Johnson",
        },
    });
    const user2 = await prisma.user.create({
        data: {
            email: "bob@example.com",
            name: "Bob Smith",
        },
    });
    await prisma.post.create({
        data: {
            title: "Premier post",
            content: "Ceci est le contenu du premier post de test.",
            published: true,
            authorId: user1.id,
        },
    });
    await prisma.post.create({
        data: {
            title: "Deuxième post",
            content: "Un autre post intéressant avec du contenu.",
            published: false,
            authorId: user2.id,
        },
    });
    await prisma.post.create({
        data: {
            title: "Post publié",
            content: "Ce post est publié et visible par tous.",
            published: true,
            authorId: user1.id,
        },
    });
    console.log("✅ Database seeding completed!");
    console.log(`📊 Created ${await prisma.user.count()} users`);
    console.log(`📝 Created ${await prisma.post.count()} posts`);
}
main()
    .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
