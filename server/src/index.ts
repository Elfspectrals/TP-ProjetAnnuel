import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { PrismaClient } from "../prisma/generated/client";

// Charger les variables d'environnement
dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du frontend en production
if (process.env.NODE_ENV === "production") {
  // 🔍 COMPREHENSIVE DEBUG INFO
  console.log(`\n🔍 FRONTEND DEBUG ANALYSIS:`);
  console.log(`  Current working directory: ${process.cwd()}`);
  console.log(`  __dirname: ${__dirname}`);
  console.log(`  __filename: ${__filename}`);

  // Explore file system structure
  try {
    console.log(`\n📁 Directory Contents:`);
    console.log(`  Contents of process.cwd() (${process.cwd()}):`);
    const cwdContents = fs.readdirSync(process.cwd());
    console.log(`    [${cwdContents.join(", ")}]`);

    const parentDir = path.join(process.cwd(), "..");
    console.log(`  Contents of parent directory (${parentDir}):`);
    const parentContents = fs.readdirSync(parentDir);
    console.log(`    [${parentContents.join(", ")}]`);

    // Check for client directory in various locations
    const clientLocations = [
      path.join(process.cwd(), "client"),
      path.join(parentDir, "client"),
      "/workspace/client",
      "/app/client",
    ];

    for (const clientLoc of clientLocations) {
      if (fs.existsSync(clientLoc)) {
        console.log(`  Found client directory at: ${clientLoc}`);
        const clientContents = fs.readdirSync(clientLoc);
        console.log(`    Contents: [${clientContents.join(", ")}]`);

        const distPath = path.join(clientLoc, "dist");
        if (fs.existsSync(distPath)) {
          console.log(`    Found dist directory at: ${distPath}`);
          const distContents = fs.readdirSync(distPath);
          console.log(`    Dist contents: [${distContents.join(", ")}]`);
        }
      }
    }
  } catch (e) {
    console.error(
      `  ❌ Error exploring directories: ${
        e instanceof Error ? e.message : String(e)
      }`
    );
  }

  // Try to find frontend files
  const possiblePaths = [
    path.join(process.cwd(), "../client/dist"),
    path.join("/workspace/client/dist"),
    path.join(__dirname, "../../client/dist"),
    path.join("/app/client/dist"),
  ];

  let clientPath = null;
  console.log(`\n🔍 Testing frontend paths:`);
  for (const testPath of possiblePaths) {
    const exists = fs.existsSync(testPath);
    console.log(`    ${testPath} - ${exists ? "✅ EXISTS" : "❌ NOT FOUND"}`);
    if (exists && !clientPath) {
      clientPath = testPath;
    }
  }

  if (!clientPath) {
    console.error(`\n❌ CRITICAL: No frontend files found!`);
    console.log(`\n🔧 ATTEMPTING RUNTIME BUILD...`);

    // Try to build frontend at runtime as emergency fallback
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

      console.log(`📦 Installing missing TypeScript types...`);
      const typesOutput = execSync("npm install --save-dev @types/react @types/react-dom", {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      console.log(`✅ TypeScript types installed:\n${typesOutput}`);

      console.log(`🔨 Running npm run build...`);
      const buildOutput = execSync("npm run build", {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      console.log(`✅ Build output:\n${buildOutput}`);

      console.log(`📁 Checking for dist directory...`);
      if (fs.existsSync("./dist")) {
        console.log(`✅ SUCCESS: Frontend built at runtime!`);
        const distContents = fs.readdirSync("./dist");
        console.log(`📁 Dist contents: [${distContents.join(", ")}]`);

        // Go back to server directory
        process.chdir("/workspace/server");
        app.use(express.static("/workspace/client/dist"));
        clientPath = "/workspace/client/dist";
      } else {
        console.log(`❌ Build failed - no dist directory created`);
      }
    } catch (buildError: any) {
      console.error(`❌ Runtime build failed!`);
      console.error(`Error message: ${buildError.message}`);
      if (buildError.stdout) console.error(`stdout: ${buildError.stdout}`);
      if (buildError.stderr) console.error(`stderr: ${buildError.stderr}`);
      process.chdir("/workspace/server"); // Ensure we're back in server dir
    }
  } else {
    console.log(`\n✅ SUCCESS: Serving frontend from: ${clientPath}`);
    app.use(express.static(clientPath));
  }

  console.log(`\n🚀 Frontend setup complete.\n`);
}

// Route API info (déplacée vers /api)
app.get("/api", (req, res) => {
  res.json({
    message: "API Server running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", async (req, res) => {
  try {
    // Tester la connexion à la base de données
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

// Routes pour les utilisateurs
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: true,
      },
    });
    res.json(users);
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({
      error: "Failed to create user",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Routes pour les posts
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
      },
    });
    res.json(posts);
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({
      error: "Failed to create post",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Fallback pour le frontend en production (SPA)
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    // Si c'est une route API qui n'existe pas, retourner 404 JSON
    if (req.path.startsWith("/api")) {
      return res.status(404).json({
        error: "API route not found",
        path: req.originalUrl,
        method: req.method,
      });
    }
    // Sinon, servir le frontend
    // Try multiple possible paths for index.html
    const possibleIndexPaths = [
      path.join(__dirname, "../../client/dist/index.html"), // Development: /workspace/server/dist -> /workspace/client/dist
      path.join(process.cwd(), "../client/dist/index.html"), // From /workspace/server -> /workspace/client/dist
      path.join("/workspace/client/dist/index.html"), // Absolute workspace path
      path.join("/app/client/dist/index.html"), // Alternative absolute path
    ];

    let indexPath = possibleIndexPaths[0]; // default
    for (const testPath of possibleIndexPaths) {
      if (fs.existsSync(testPath)) {
        indexPath = testPath;
        break;
      }
    }

    console.log(`Serving frontend for ${req.path}, file path: ${indexPath}`);

    // Vérifier que le fichier existe
    if (!fs.existsSync(indexPath)) {
      console.error(
        `Frontend file not found. Tried paths:`,
        possibleIndexPaths
      );
      return res.status(404).json({
        error: "Frontend not found",
        path: indexPath,
        triedPaths: possibleIndexPaths,
        message: "The frontend build files are missing",
      });
    }

    res.sendFile(indexPath);
  });
} else {
  // Gestion des erreurs 404 en développement
  app.use("*", (req, res) => {
    res.status(404).json({
      error: "Route not found",
      path: req.originalUrl,
      method: req.method,
    });
  });
}

// Gestion des erreurs globales
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error:", err);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  }
);

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("Starting graceful shutdown...");
  await prisma.$disconnect();
  console.log("Database disconnected");
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Démarrer le serveur
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🗄️  Database URL: ${
      process.env.DATABASE_URL ? "configured" : "not configured"
    }`
  );
});
