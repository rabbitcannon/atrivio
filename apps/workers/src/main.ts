// Queue definitions (to be implemented with feature modules)
const _queues: string[] = [
  // 'cart-recovery',
  // 'ticket-settlement',
  // 'export',
  // 'webhook-retry',
  // 'notifications',
  // 'queue-progression',
];

// Placeholder for worker registration
// Workers will be added as features are implemented

async function startWorkers() {
  // Dynamic import for ESM compatibility
  const { Redis } = await import('ioredis');

  // Redis connection for BullMQ
  const connection = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });

  // Keep process alive
  process.on('SIGTERM', async () => {
    await connection.quit();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    await connection.quit();
    process.exit(0);
  });
}

startWorkers().catch((_error) => {
  process.exit(1);
});
