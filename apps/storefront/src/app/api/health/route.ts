/**
 * Health check endpoint for load balancers and monitoring
 */
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'storefront',
  });
}
