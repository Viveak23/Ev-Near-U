export const initTelemetrySocket = (io) => {
  io.on('connection', (socket) => {
    // Client joins a session room
    socket.on('join_session', (sessionId) => {
      socket.join(`session_${sessionId}`);
    });

    // Client leaves session room
    socket.on('leave_session', (sessionId) => {
      socket.leave(`session_${sessionId}`);
    });

    // Telemetry update broadcasted to all viewers in room
    socket.on('telemetry_tick', (data) => {
      const { sessionId, telemetry } = data;
      io.to(`session_${sessionId}`).emit('telemetry_update', telemetry);
    });

    // Session stopped event
    socket.on('session_stopped', (data) => {
      const { sessionId, finalBill } = data;
      io.to(`session_${sessionId}`).emit('session_ended', { sessionId, finalBill });
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
};
