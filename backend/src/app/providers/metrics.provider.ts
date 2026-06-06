import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import { Request, Response } from 'express';

export class MetricsProvider {
  private static registry = new Registry();

  static {
    collectDefaultMetrics({ register: this.registry });
  }

  static httpRequestsCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status'],
    registers: [this.registry],
  });

  static httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path'],
    registers: [this.registry],
  });

  static async getMetrics(req: Request, res: Response) {
    res.set('Content-Type', this.registry.contentType);
    res.end(await this.registry.metrics());
  }
}
