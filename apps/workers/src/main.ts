import { Worker } from 'bullmq';
import IORedis from 'ioredis';

// Redis connection for BullMQ
const connection = new IORedis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

console.log('🔧 Haunt Platform Workers starting...');

// Queue definitions (to be implemented with feature modules)
const queues = [
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
  console.log('📋 Registered queues:', queues.length > 0 ? queues.join(', ') : 'none');

  // Health check endpoint would go here in production
  console.log('✅ Workers ready (no processors registered yet)');

  // Keep process alive
  process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down workers...');
    await connection.quit();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('🛑 Shutting down workers...');
    await connection.quit();
    process.exit(0);
  });
}

startWorkers().catch((error) => {
  console.error('❌ Failed to start workers:', error);
  process.exit(1);
});
