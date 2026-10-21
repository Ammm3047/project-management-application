import jwt from 'jsonwebtoken';

// Step 1: auth handshake only. Room/board events are added in Step 3.
export function initSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`socket connected: ${socket.id} (user ${socket.userId})`);
    // TODO (Step 3): join_board / leave_board with membership check
    socket.on('disconnect', () => console.log(`socket disconnected: ${socket.id}`));
  });
}
