import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { logger } from "../utils/logger.js";
import { WebSocketEvents, LeaderboardUpdatePayload, TimeExtensionPayload, NewBidPayload, AuctionEndedPayload, ErrorPayload, JoinAuctionRequest, LeaveAuctionRequest } from "../interfaces/websocket.interface.js";
import { AUTH_COOKIE_NAME } from "../interfaces/auth.interface.js";
import { authService } from "./auth.service.js";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, Set<string>> = new Map(); // auctionId -> Set of socketIds

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Initialize Socket.IO server
   */
  public initialize(server: HTTPServer): void {
    // this.io = new SocketIOServer(server, {
    //   cors: {
    //     origin: "*", // Configure this based on your frontend URL in production
    //     methods: ["GET", "POST"],
    //     credentials: true,
    //   },
    //   transports: ["websocket", "polling"],
    // });

    // this.setupMiddleware();
    // this.setupConnectionHandlers();

    // logger.info("✅ WebSocket service initialized");

    try {
      logger.info("🔄 Initializing WebSocket service...");

      // Get allowed origins from environment variable
      const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000").split(",");

      this.io = new SocketIOServer(server, {
        cors: {
          origin: allowedOrigins, // Use same origins as REST API
          methods: ["GET", "POST"],
          credentials: true,
        },
        transports: ["websocket", "polling"],
      });

      // Log server engine events for debugging
      this.io.engine.on("connection_error", (err) => {
        logger.error("❌ Connection error:", {
          message: err.message,
          code: err.code,
          context: err.context,
        });
      });

      this.setupMiddleware();
      this.setupConnectionHandlers();

      logger.info("✅ WebSocket service initialized successfully");
      logger.info(`📡 WebSocket listening on path: /socket.io/`);
    } catch (error) {
      logger.error("❌ Failed to initialize WebSocket service", {
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  /**
   * Setup middleware for authentication
   * Supports token from: cookie, auth object, or Authorization header
   */
  private setupMiddleware(): void {
    if (!this.io) return;

    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        // Try to extract token from multiple sources
        let token: string | undefined;

        // 1. Try cookie first (from handshake headers)
        const cookieHeader = socket.handshake.headers.cookie;
        if (cookieHeader) {
          const cookies = cookie.parse(cookieHeader);
          token = cookies[AUTH_COOKIE_NAME];
        }

        // 2. Fallback to auth object
        if (!token) {
          token = socket.handshake.auth.token;
        }

        // 3. Fallback to Authorization header
        if (!token) {
          token = socket.handshake.headers.authorization?.split(" ")[1];
        }

        if (!token) {
          logger.warn("WebSocket connection attempt without token", {
            socketId: socket.id,
          });
          return next(new Error("Authentication token required"));
        }

        // Verify JWT token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          logger.error("JWT_SECRET not configured");
          return next(new Error("Server configuration error"));
        }

        const decoded = jwt.verify(token, jwtSecret) as { userId: string; role: string };

        // Validate session exists in database
        const isValidSession = await authService.validateSession(token);
        if (!isValidSession) {
          logger.warn("WebSocket connection with invalid/expired session", {
            socketId: socket.id,
          });
          return next(new Error("Session expired or invalid"));
        }

        // Validate user status
        const user = await authService.validateUser(decoded.userId);
        if (!user || user.rejectedAt || user.status !== "active" || user.deleted) {
          logger.warn("WebSocket connection with invalid user", {
            socketId: socket.id,
            userId: decoded.userId,
          });
          return next(new Error("User not authorized"));
        }

        socket.userId = decoded.userId;
        socket.userRole = decoded.role;

        logger.info("WebSocket client authenticated", {
          socketId: socket.id,
          userId: socket.userId,
        });

        next();
      } catch (error) {
        logger.error("WebSocket authentication failed", {
          error: error instanceof Error ? error.message : error,
          socketId: socket.id,
        });
        next(new Error("Authentication failed"));
      }
    });
  }

  /**
   * Setup connection handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket: AuthenticatedSocket) => {
      logger.info("Client connected", {
        socketId: socket.id,
        userId: socket.userId,
      });

      // Handle join auction room
      socket.on(WebSocketEvents.JOIN_AUCTION, (data: JoinAuctionRequest) => {
        this.handleJoinAuction(socket, typeof data === "string" ? JSON.parse(data) : data);
      });

      // Handle leave auction room
      socket.on(WebSocketEvents.LEAVE_AUCTION, (data: LeaveAuctionRequest) => {
        this.handleLeaveAuction(socket, typeof data === "string" ? JSON.parse(data) : data);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });

      // Handle errors
      socket.on("error", (error) => {
        logger.error("WebSocket error", {
          socketId: socket.id,
          userId: socket.userId,
          error,
        });
      });
    });
  }

  /**
   * Handle client joining an auction room
   */
  private handleJoinAuction(socket: AuthenticatedSocket, data: JoinAuctionRequest): void {
    try {
      const { auctionId } = data;
      console.log("auctionId: ", auctionId);
      const roomName = `auction:${auctionId}`;

      // Join the room
      socket.join(roomName);

      // Track the connection
      if (!this.connectedUsers.has(auctionId)) {
        this.connectedUsers.set(auctionId, new Set());
      }
      this.connectedUsers.get(auctionId)!.add(socket.id);

      logger.info("Client joined auction room", {
        socketId: socket.id,
        userId: socket.userId,
        auctionId,
        roomName,
        totalInRoom: this.connectedUsers.get(auctionId)!.size,
      });

      // Send acknowledgment
      socket.emit("joined_auction", {
        auctionId,
        message: "Successfully joined auction",
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error("Error joining auction room", {
        error: error instanceof Error ? error.message : error,
        socketId: socket.id,
      });
      this.emitError(socket, "Failed to join auction");
    }
  }

  /**
   * Handle client leaving an auction room
   */
  private handleLeaveAuction(socket: AuthenticatedSocket, data: LeaveAuctionRequest): void {
    try {
      const { auctionId } = data;
      const roomName = `auction:${auctionId}`;

      // Leave the room
      socket.leave(roomName);

      // Remove from tracking
      if (this.connectedUsers.has(auctionId)) {
        this.connectedUsers.get(auctionId)!.delete(socket.id);
        if (this.connectedUsers.get(auctionId)!.size === 0) {
          this.connectedUsers.delete(auctionId);
        }
      }

      logger.info("Client left auction room", {
        socketId: socket.id,
        userId: socket.userId,
        auctionId,
        roomName,
      });

      // Send acknowledgment
      socket.emit("left_auction", {
        auctionId,
        message: "Successfully left auction",
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error("Error leaving auction room", {
        error: error instanceof Error ? error.message : error,
        socketId: socket.id,
      });
      this.emitError(socket, "Failed to leave auction");
    }
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnect(socket: AuthenticatedSocket): void {
    logger.info("Client disconnected", {
      socketId: socket.id,
      userId: socket.userId,
    });

    // Remove from all tracked auctions
    this.connectedUsers.forEach((sockets, auctionId) => {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          this.connectedUsers.delete(auctionId);
        }
      }
    });
  }

  /**
   * Emit leaderboard update to all clients in an auction room
   */
  public emitLeaderboardUpdate(auctionId: string, payload: LeaderboardUpdatePayload): void {
    if (!this.io) {
      logger.warn("Cannot emit leaderboard update: WebSocket not initialized");
      return;
    }

    const roomName = `auction:${auctionId}`;
    this.io.to(roomName).emit(WebSocketEvents.AUCTION_LEADERBOARD_UPDATE, payload);

    logger.info("Leaderboard update emitted", {
      auctionId,
      roomName,
      participantsCount: payload.participants.length,
      currentHighestBid: payload.currentHighestBid,
    });
  }

  /**
   * Emit time extension notification
   */
  public emitTimeExtension(auctionId: string, payload: TimeExtensionPayload): void {
    if (!this.io) {
      logger.warn("Cannot emit time extension: WebSocket not initialized");
      return;
    }

    const roomName = `auction:${auctionId}`;
    this.io.to(roomName).emit(WebSocketEvents.AUCTION_TIME_EXTENDED, payload);

    logger.info("Time extension emitted", {
      auctionId,
      roomName,
      newEndTime: payload.newEndTime,
      extensionMinutes: payload.extensionMinutes,
    });
  }

  /**
   * Emit new bid notification
   */
  public emitNewBid(auctionId: string, payload: NewBidPayload): void {
    if (!this.io) {
      logger.warn("Cannot emit new bid: WebSocket not initialized");
      return;
    }

    const roomName = `auction:${auctionId}`;
    this.io.to(roomName).emit(WebSocketEvents.NEW_BID_PLACED, payload);

    logger.info("New bid notification emitted", {
      auctionId,
      roomName,
      bidAmount: payload.bidAmount,
      userId: payload.userId,
    });
  }

  /**
   * Emit auction ended notification
   */
  public emitAuctionEnded(auctionId: string, payload: AuctionEndedPayload): void {
    if (!this.io) {
      logger.warn("Cannot emit auction ended: WebSocket not initialized");
      return;
    }

    const roomName = `auction:${auctionId}`;
    this.io.to(roomName).emit(WebSocketEvents.AUCTION_ENDED, payload);

    logger.info("Auction ended notification emitted", {
      auctionId,
      roomName,
      winner: payload.winner?.userId,
      totalBids: payload.totalBids,
    });
  }

  /**
   * Emit error to a specific socket
   */
  private emitError(socket: Socket, message: string, code?: string): void {
    const payload: ErrorPayload = {
      message,
      code,
      timestamp: new Date(),
    };
    socket.emit(WebSocketEvents.ERROR, payload);
  }

  /**
   * Get the number of connected users for an auction
   */
  public getConnectedUsersCount(auctionId: string): number {
    return this.connectedUsers.get(auctionId)?.size || 0;
  }

  /**
   * Check if WebSocket is initialized
   */
  public isInitialized(): boolean {
    return this.io !== null;
  }

  /**
   * Get Socket.IO instance (for advanced usage)
   */
  public getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const websocketService = WebSocketService.getInstance();
