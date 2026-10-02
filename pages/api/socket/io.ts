import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponse } from "next";
import { verifyToken } from "@/lib/auth/jwt";
import { parse } from "cookie";
import { connectDB } from "@/lib/db";
import DeliveryAssignment from "@/models/DeliveryAssignment";
import Order from "@/models/Order";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: any & {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    });
    
    io.on("connection", (socket) => {
      // Helper to check auth
      const getUserIdFromCookie = async (cookieStr?: string) => {
        if (!cookieStr) return null;
        const cookiesObj = parse(cookieStr);
        const token = cookiesObj["auth_token"];
        if (!token) return null;
        try {
          const payload = await verifyToken(token);
          return payload?.userId as string;
        } catch {
          return null;
        }
      };

      socket.on("delivery:join", async (orderId) => {
        const userId = await getUserIdFromCookie(socket.handshake.headers.cookie);
        if (!userId) {
          socket.emit("delivery:error", { message: "Unauthorized" });
          return;
        }
        await connectDB();
        // Check if user is either customer of this order or assigned delivery partner
        const order = await Order.findById(orderId).select("customerId").lean();
        const assignment = await DeliveryAssignment.findOne({ orderId }).select("deliveryPartnerId").lean();
        
        if (order?.customerId?.toString() === userId || assignment?.deliveryPartnerId?.toString() === userId) {
          socket.join(`order:${orderId}`);
        } else {
          socket.emit("delivery:error", { message: "Unauthorized" });
        }
      });
      
      socket.on("delivery:location-update", async (data) => {
        const userId = await getUserIdFromCookie(socket.handshake.headers.cookie);
        if (!userId) return;
        await connectDB();
        const assignment = await DeliveryAssignment.findOne({ orderId: data.orderId }).select("deliveryPartnerId").lean();
        if (assignment?.deliveryPartnerId?.toString() === userId) {
          io.to(`order:${data.orderId}`).emit("delivery:location", data);
        }
      });
      
      socket.on("delivery:stop-tracking", async (orderId) => {
        const userId = await getUserIdFromCookie(socket.handshake.headers.cookie);
        if (!userId) return;
        await connectDB();
        const assignment = await DeliveryAssignment.findOne({ orderId }).select("deliveryPartnerId").lean();
        if (assignment?.deliveryPartnerId?.toString() === userId) {
          io.to(`order:${orderId}`).emit("delivery:offline", { orderId });
        }
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
