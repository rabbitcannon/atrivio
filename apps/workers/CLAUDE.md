# Workers - Background Jobs

## Stack

- BullMQ for job queues
- Redis for queue storage
- Uses service-role key (bypasses RLS for background tasks)

## Structure

```
src/
├── main.ts           # Worker bootstrap
├── processors/       # Job processors
└── config/           # Configuration
```

## Processor Pattern

```typescript
// processors/cart-recovery.processor.ts
import { Worker, Job } from 'bullmq';

const processor = new Worker('cart-recovery', async (job: Job) => {
  const { cartId, userId } = job.data;
  // Process abandoned cart...
}, { connection });
```

## Planned Queues

| Queue | Purpose |
|-------|---------|
| `cart-recovery` | Abandoned cart emails |
| `ticket-settlement` | Batch payment settlement |
| `export` | Report/data exports |
| `webhook-retry` | Failed webhook retries |
| `notifications` | Email/SMS sending |
| `queue-progression` | Virtual queue advancement |

## Key Rules

1. **Idempotency**: Jobs may retry - design for idempotent processing
2. **Service role**: Workers use Supabase service-role key
3. **Logging**: Log job start, completion, and failures
4. **Timeouts**: Set appropriate job timeouts

## Environment

- `REDIS_URL`: Redis connection string
- `SUPABASE_SERVICE_ROLE_KEY`: For database access
