"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("../prisma/generated/client");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT || "3000", 10);
const prisma = new client_1.PrismaClient();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "production") {
    console.log(`\n🔍 FRONTEND DEBUG ANALYSIS:`);
    console.log(`  Current working directory: ${process.cwd()}`);
    console.log(`  __dirname: ${__dirname}`);
    console.log(`  __filename: ${__filename}`);
    try {
        console.log(`\n📁 Directory Contents:`);
        console.log(`  Contents of process.cwd() (${process.cwd()}):`);
        const cwdContents = fs_1.default.readdirSync(process.cwd());
        console.log(`    [${cwdContents.join(", ")}]`);
        const parentDir = path_1.default.join(process.cwd(), "..");
        console.log(`  Contents of parent directory (${parentDir}):`);
        const parentContents = fs_1.default.readdirSync(parentDir);
        console.log(`    [${parentContents.join(", ")}]`);
        const clientLocations = [
            path_1.default.join(process.cwd(), "client"),
            path_1.default.join(parentDir, "client"),
            "/workspace/client",
            "/app/client",
        ];
        for (const clientLoc of clientLocations) {
            if (fs_1.default.existsSync(clientLoc)) {
                console.log(`  Found client directory at: ${clientLoc}`);
                const clientContents = fs_1.default.readdirSync(clientLoc);
                console.log(`    Contents: [${clientContents.join(", ")}]`);
                const distPath = path_1.default.join(clientLoc, "dist");
                if (fs_1.default.existsSync(distPath)) {
                    console.log(`    Found dist directory at: ${distPath}`);
                    const distContents = fs_1.default.readdirSync(distPath);
                    console.log(`    Dist contents: [${distContents.join(", ")}]`);
                }
            }
        }
    }
    catch (e) {
        console.error(`  ❌ Error exploring directories: ${e instanceof Error ? e.message : String(e)}`);
    }
    const possiblePaths = [
        path_1.default.join(__dirname, "../../client/dist"),
        path_1.default.join(process.cwd(), "../client/dist"),
        path_1.default.join("/workspace/client/dist"),
        path_1.default.join("/app/client/dist"),
        path_1.default.join("/home/jerome/TP-ProjetAnnuel/client/dist"),
    ];
    let clientPath = null;
    console.log(`\n🔍 Testing frontend paths:`);
    for (const testPath of possiblePaths) {
        const exists = fs_1.default.existsSync(testPath);
        console.log(`    ${testPath} - ${exists ? "✅ EXISTS" : "❌ NOT FOUND"}`);
        if (exists && !clientPath) {
            clientPath = testPath;
        }
    }
    if (!clientPath) {
        console.error(`\n❌ CRITICAL: No frontend files found!`);
        console.log(`\n🔧 ATTEMPTING RUNTIME BUILD...`);
        try {
            const { execSync } = require("child_process");
            console.log(`📍 Current directory: ${process.cwd()}`);
            console.log(`🔄 Changing to client directory...`);
            process.chdir("/workspace/client");
            console.log(`📍 Now in: ${process.cwd()}`);
            console.log(`📦 Installing client dependencies...`);
            const installOutput = execSync("npm ci", {
                encoding: "utf8",
                stdio: ["pipe", "pipe", "pipe"],
            });
            console.log(`✅ Dependencies installed:\n${installOutput}`);
            console.log(`📦 Installing Vite (if missing)...`);
            const viteInstallOutput = execSync("npm install --save-dev vite @vitejs/plugin-react", {
                encoding: "utf8",
                stdio: ["pipe", "pipe", "pipe"],
            });
            console.log(`✅ Vite installed:\n${viteInstallOutput}`);
            console.log(`🔨 Building frontend with Vite...`);
            const buildOutput = execSync("npx vite build", {
                encoding: "utf8",
                stdio: ["pipe", "pipe", "pipe"],
            });
            console.log(`✅ Build output:\n${buildOutput}`);
            console.log(`📁 Checking for dist directory...`);
            if (fs_1.default.existsSync("./dist")) {
                console.log(`✅ SUCCESS: Frontend built at runtime!`);
                const distContents = fs_1.default.readdirSync("./dist");
                console.log(`📁 Dist contents: [${distContents.join(", ")}]`);
                process.chdir("/workspace/server");
                app.use(express_1.default.static("/workspace/client/dist"));
                clientPath = "/workspace/client/dist";
            }
            else {
                console.log(`❌ Build failed - no dist directory created`);
            }
        }
        catch (buildError) {
            console.error(`❌ Runtime build failed!`);
            console.error(`Error message: ${buildError.message}`);
            if (buildError.stdout)
                console.error(`stdout: ${buildError.stdout}`);
            if (buildError.stderr)
                console.error(`stderr: ${buildError.stderr}`);
            process.chdir("/workspace/server");
        }
    }
    else {
        console.log(`\n✅ SUCCESS: Serving frontend from: ${clientPath}`);
        app.use(express_1.default.static(clientPath));
    }
    console.log(`\n🚀 Frontend setup complete.\n`);
}
app.get("/api", (req, res) => {
    res.json({
        message: "API Server running!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});
app.get("/health", async (req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            status: "healthy",
            database: "connected",
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(500).json({
            status: "unhealthy",
            database: "disconnected",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
        });
    }
});
app.get("/api/users", async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                posts: true,
            },
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({
            error: "Failed to fetch users",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
app.post("/api/users", async (req, res) => {
    try {
        const { email, name } = req.body;
        const user = await prisma.user.create({
            data: {
                email,
                name,
            },
        });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({
            error: "Failed to create user",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
app.get("/api/posts", async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: true,
            },
        });
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({
            error: "Failed to fetch posts",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
app.post("/api/posts", async (req, res) => {
    try {
        const { title, content, authorId } = req.body;
        const post = await prisma.post.create({
            data: {
                title,
                content,
                authorId: parseInt(authorId),
            },
            include: {
                author: true,
            },
        });
        res.status(201).json(post);
    }
    catch (error) {
        res.status(500).json({
            error: "Failed to create post",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
if (process.env.NODE_ENV === "production") {
    app.get("*", (req, res) => {
        if (req.path.startsWith("/api")) {
            return res.status(404).json({
                error: "API route not found",
                path: req.originalUrl,
                method: req.method,
            });
        }
        const possibleIndexPaths = [
            path_1.default.join(__dirname, "../../client/dist/index.html"),
            path_1.default.join(process.cwd(), "../client/dist/index.html"),
            path_1.default.join("/workspace/client/dist/index.html"),
            path_1.default.join("/app/client/dist/index.html"),
            path_1.default.join("/home/jerome/TP-ProjetAnnuel/client/dist/index.html"),
        ];
        let indexPath = possibleIndexPaths[0];
        for (const testPath of possibleIndexPaths) {
            if (fs_1.default.existsSync(testPath)) {
                indexPath = testPath;
                break;
            }
        }
        console.log(`Serving frontend for ${req.path}, file path: ${indexPath}`);
        if (!fs_1.default.existsSync(indexPath)) {
            console.error(`Frontend file not found. Tried paths:`, possibleIndexPaths);
            return res.status(404).json({
                error: "Frontend not found",
                path: indexPath,
                triedPaths: possibleIndexPaths,
                message: "The frontend build files are missing",
            });
        }
        res.sendFile(indexPath);
    });
}
else {
    app.use("*", (req, res) => {
        res.status(404).json({
            error: "Route not found",
            path: req.originalUrl,
            method: req.method,
        });
    });
}
app.use((err, req, res, next) => {
    console.error("Global error:", err);
    res.status(500).json({
        error: "Internal server error",
        details: process.env.NODE_ENV === "development"
            ? err.message
            : "Something went wrong",
    });
});
const gracefulShutdown = async () => {
    console.log("Starting graceful shutdown...");
    await prisma.$disconnect();
    console.log("Database disconnected");
    process.exit(0);
};
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🗄️  Database URL: ${process.env.DATABASE_URL ? "configured" : "not configured"}`);
});
