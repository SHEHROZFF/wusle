import { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getCurrentStage() {
  const now = new Date();
  const active = await prisma.presaleStage.findFirst({
    where: { startTime: { lte: now }, endTime: { gte: now } },
    orderBy: { stageNumber: "asc" },
  });
  if (active) return active;

  const upcoming = await prisma.presaleStage.findFirst({
    where: { startTime: { gt: now } },
    orderBy: { startTime: "asc" },
  });
  return upcoming || null;
}

export default function SocketHandler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure res.socket is available
  if (!res.socket) {
    console.error("Socket not found on response");
    res.end();
    return;
  }

  // Type assertion to bypass TS error since res.socket doesn't have server in its type definition
  const socketServer = res.socket as any;

  // Only initialize once
  if (!socketServer.server?.io) {
    console.log("First use, starting Socket.io");

    const io = new Server(socketServer.server, {
      path: "/api/socketio",
      cors: { origin: "*" },
    });
    socketServer.server.io = io;

    io.on("connection", async (socket) => {
      console.log("Socket connected:", socket.id);

      async function emitPresaleInfo() {
        const allStages = await prisma.presaleStage.findMany({
          orderBy: { stageNumber: "asc" },
        });

        const stage = await getCurrentStage();
        let currentStage = 0;
        let endsAt = new Date().toISOString();
        let wusleRate = 0.0037;
        let listingPrice = 0.005;

        if (stage) {
          currentStage = stage.stageNumber;
          endsAt = stage.endTime.toISOString();
          wusleRate = stage.rate;
          listingPrice = stage.listingPrice;
        }

        socket.emit("presaleInfo", {
          stages: allStages,
          currentStage,
          endsAt,
          wusleRate,
          listingPrice,
        });
      }

      await emitPresaleInfo();

      const interval = setInterval(async () => {
        await emitPresaleInfo();
      }, 10_000);

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
        clearInterval(interval);
      });
    });
  } else {
    console.log("Socket.io already running");
  }

  res.end();
}







// // pages/api/socketio.ts
// import { NextApiRequest, NextApiResponse } from "next";
// import { Server } from "socket.io";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// /** Return the current active or next upcoming stage from DB */
// async function getCurrentStage() {
//   const now = new Date();
//   // Find a stage that's currently active
//   const active = await prisma.presaleStage.findFirst({
//     where: { startTime: { lte: now }, endTime: { gte: now } },
//     orderBy: { stageNumber: "asc" },
//   });
//   if (active) return active;

//   // Or the next upcoming stage
//   const upcoming = await prisma.presaleStage.findFirst({
//     where: { startTime: { gt: now } },
//     orderBy: { startTime: "asc" },
//   });
//   return upcoming || null;
// }

// export default function SocketHandler(req: NextApiRequest, res: NextApiResponse) {
//   // Only initialize once
//   if (!res.socket.server.io) {
//     console.log("First use, starting Socket.io");

//     const io = new Server(res.socket.server, {
//       path: "/api/socketio",
//       cors: { origin: "*" },
//     });
//     res.socket.server.io = io;

//     io.on("connection", async (socket) => {
//       console.log("Socket connected:", socket.id);

//       // Function to emit the presale info (all stages + current stage)
//       async function emitPresaleInfo() {
//         // Grab all stages
//         const allStages = await prisma.presaleStage.findMany({
//           orderBy: { stageNumber: "asc" },
//         });

//         // Find current or next stage
//         const stage = await getCurrentStage();
//         let currentStage = 0;
//         let endsAt = new Date().toISOString();
//         let wusleRate = 0.0037;
//         let listingPrice = 0.005;

//         if (stage) {
//           currentStage = stage.stageNumber;
//           endsAt = stage.endTime.toISOString();
//           wusleRate = stage.rate;
//           listingPrice = stage.listingPrice;
//         }

//         // Emit everything
//         socket.emit("presaleInfo", {
//           stages: allStages,      // full array of stages
//           currentStage,           // e.g. 1,2,3...
//           endsAt,
//           wusleRate,
//           listingPrice,
//         });
//       }

//       // Emit immediately
//       await emitPresaleInfo();

//       // Then periodically update
//       const interval = setInterval(async () => {
//         await emitPresaleInfo();
//       }, 10_000); // e.g. every 10s

//       socket.on("disconnect", () => {
//         console.log("Socket disconnected:", socket.id);
//         clearInterval(interval);
//       });
//     });
//   } else {
//     console.log("Socket.io already running");
//   }

//   res.end();
// }










// // pages/api/socketio.ts
// import { NextApiRequest, NextApiResponse } from "next";
// import { Server } from "socket.io";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// /** Return the current active or upcoming stage from DB */
// async function getCurrentStage() {
//   const now = new Date();
//   // Find a stage that is currently active
//   const stage = await prisma.presaleStage.findFirst({
//     where: {
//       startTime: { lte: now },
//       endTime: { gte: now },
//     },
//     orderBy: { stageNumber: "asc" },
//   });
//   // console.log("Current stagedsadsa:", stage);
  
//   if (stage) return stage;

//   // else find next upcoming
//   const next = await prisma.presaleStage.findFirst({
//     where: {
//       startTime: { gt: now },
//     },
//     orderBy: { startTime: "asc" },
//   });

//   // console.log("fjndsjknfjkdsnfjnds");
  
//   return next || null;
// }

// export default function SocketHandler(req: NextApiRequest, res: NextApiResponse) {
//   if (!res.socket.server.io) {
//     console.log("First use, starting Socket.io");

//     // Create a socket.io server, attaching it to the Next.js socket
//     const io = new Server(res.socket.server, {
//       path: "/api/socketio", // optional
//       cors: { origin: "*" },
//     });
//     res.socket.server.io = io;

//     // Handle new connections
//     io.on("connection", async (socket) => {
//       console.log("Socket connected:", socket.id);

//       // 1) find the current stage
//       const stage = await getCurrentStage();
//       // console.log("Current stage:", stage);
      

//       if (stage) {
//         const totalStages = await prisma.presaleStage.count();
//         socket.emit("presaleInfo", {
//           stage: stage.stageNumber,
//           totalStages,
//           endsAt: stage.endTime.toISOString(),
//           raised: stage.raised,
//           target: stage.target,
//           wusleRate: stage.rate,
//           listingPrice: stage.listingPrice,
//         });
//       } else {
//         // none found means no presale or it's ended
//         socket.emit("presaleInfo", {
//           stage: 0,
//           totalStages: 0,
//           endsAt: new Date().toISOString(),
//           raised: 0,
//           target: 0,
//           wusleRate: 0,
//           listingPrice: 0,
//         });
//       }

//       // Example: update data every 10 seconds
//       const interval = setInterval(async () => {
//         const newStage = await getCurrentStage();
//         if (newStage) {
//           const totalStages = await prisma.presaleStage.count();
//           socket.emit("presaleInfo", {
//             stage: newStage.stageNumber,
//             totalStages,
//             endsAt: newStage.endTime.toISOString(),
//             raised: newStage.raised,
//             target: newStage.target,
//             wusleRate: newStage.rate,
//             listingPrice: newStage.listingPrice,
//           });
//         } else {
//           socket.emit("presaleInfo", {
//             stage: 0,
//             totalStages: 0,
//             endsAt: new Date().toISOString(),
//             raised: 0,
//             target: 0,
//             wusleRate: 0,
//             listingPrice: 0,
//           });
//         }
//       }, 10_000); // every 10 seconds

//       // On disconnect, clear the interval
//       socket.on("disconnect", () => {
//         console.log("Socket disconnected:", socket.id);
//         clearInterval(interval);
//       });
//     });
//   } else {
//     console.log("Socket.io already running");
//   }

//   // We must send a response quickly
//   res.end();
// }
