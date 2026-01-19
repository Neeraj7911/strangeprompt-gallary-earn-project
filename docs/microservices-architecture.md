# StrangePrompt Microservices Architecture

## 1. Global Edge & Delivery Layer
- **DNS & Anycast Load Balancer**: Cloud provider global load balancer (AWS Global Accelerator, Cloudflare, Google Cloud Load Balancing) receiving all HTTPS traffic with TLS termination and rate limiting.
- **Web Application Firewall (WAF)**: Apply managed WAF rulesets for OWASP Top 10, IP reputation, and geo-fencing. Enable anomaly scoring and automated mitigation.
- **Content Delivery Network (CDN)**: Serve static assets (SPA bundle, fonts, images) from CloudFront / Cloud CDN / Cloudflare CDN with cache-key normalization and stale-while-revalidate.

## 2. API Access Layer
- **API Gateway**: Managed gateway (AWS API Gateway HTTP API or GCP API Gateway) handling authentication (JWT + OAuth scopes), request validation, throttling, and routing per service version (`/v1/auth`, `/v1/gallery`, etc.).
- **Service Mesh Ingress**: For internal traffic, use Istio / Linkerd ingress gateway to enforce mTLS, retries, and policy enforcement once requests enter the cluster.

## 3. Core Microservices (Containerized)
Deploy as individual services on a managed Kubernetes offering (EKS/GKE/AKS) or ECS Fargate. Default image runtime: distroless Node.js for API services, Python for analytics.

| Service | Tech | Responsibility | Scaling Baseline |
|---------|------|----------------|------------------|
| Auth Service | Node.js + NestJS | Sign-up, login, token issuance, refresh handling | HPA min 4 pods, autoscale on CPU>55% or p95 latency>120ms |
| Profile Service | Node.js + Fastify | Manage user profiles, social graph, preferences | HPA min 4 pods, scale on CPU>60% |
| Gallery Service | Node.js + Fastify | Prompt/image CRUD, feed assembly, metadata | HPA min 8 pods, scale on CPU>55% + custom metric (RPS>8k) |
| Media Processor | Go / Rust workers | Image ingestion, optimization, thumbnails (connected to SQS) | Fargate tasks scale 2–200 based on queue depth |
| Analytics Service | Python + FastAPI | Real-time counters, aggregates, anomaly detection | HPA min 6 pods, scale on CPU & Kafka lag |
| Notifications Service | Node.js + BullMQ | Email/push scheduling, digest generation | Autoscale workers 2–150 on Redis queue depth |

## 4. Data & Storage Strategy
- **User/Auth Data**: Amazon Aurora PostgreSQL (serverless v2) with read replicas across two AZs. Use row-level security for tenant isolation.
- **Gallery Metadata**: DynamoDB (on-demand) or Firestore native mode; design partition keys around `creatorId#category` to avoid hot partitions.
- **Image Storage**: S3 with Intelligent-Tiering. Use S3 signed URLs for secure access. Replicate to secondary region using Cross-Region Replication.
- **Caching**: ElastiCache Redis (cluster mode) for session tokens, hot prompts, and rate-limiter counters. Implement cache-aside pattern.
- **Search**: OpenSearch / Elastic Cloud cluster for prompt search, filtering, and analytics dashboards.
- **Event Log**: Kafka (MSK) or Pub/Sub for clickstream, prompt interactions, and fan-out processing.

## 5. Asynchronous & Streaming Backbone
- **Event Bus**: Kafka topics (`gallery.views`, `gallery.likes`, `user.signup`) with schema registry; consumers explicitly versioned.
- **Task Queues**: SQS + Lambda / Cloud Tasks for email delivery, image moderation, and long-running jobs.
- **Stream Processing**: Use Flink / Kinesis Data Analytics / Dataflow to aggregate metrics and feed real-time dashboards.

## 6. Observability & Reliability
- **Logging**: Structured JSON logs pushed to CloudWatch Logs / Stackdriver; retain 30 days hot, archive to S3/BigQuery.
- **Metrics**: Prometheus (managed by AMP / GMP) with Grafana dashboards; track p50/p95 latency, RPS, error budgets.
- **Tracing**: OpenTelemetry Collector exporting to AWS X-Ray / Cloud Trace / Datadog APM.
- **Resilience Patterns**: Circuit breakers (Envoy filters), retries with jitter, bulkheads per service, graceful degradation for non-critical paths.
- **Chaos Testing**: Enable AWS Fault Injection Simulator or LitmusChaos to validate failure handling weekly.

## 7. CI/CD & Deployment
- **Repository Structure**: Mono-repo with service directories (`services/auth`, `services/gallery`, etc.) and shared libraries in `packages/`.
- **Pipelines**: GitHub Actions or GitLab CI -> unit tests -> container builds -> Trivy scan -> Helm chart deploy. Use progressive delivery (Argo Rollouts) with canary + automated rollback on unhealthy metrics.
- **Secrets Management**: AWS Secrets Manager / GCP Secret Manager integrated via CSI driver in Kubernetes.
- **Infrastructure as Code**: Terraform or Pulumi modules for network, clusters, gateways, and data stores. Enforce review + drift detection.

## 8. Scalability Targets & Capacity Planning
- Design for sustained 10M+ monthly views (~4k RPS peak). Each service configured with:
  - **Autoscaling** on CPU, memory, and custom latency metrics.
  - **Burst Handling** using queue buffering (SQS/Kafka) and CDN caching to absorb surges.
  - **Regional Failover**: Active-active deployment across two regions with DNS health checks and data replication (Aurora global database + S3 CRR).
  - **Disaster Recovery RPO/RTO**: Aim RPO < 5 minutes, RTO < 30 minutes via point-in-time recovery and warm standby clusters.

## 9. Security & Compliance
- Enforce Zero Trust with service mesh mTLS and fine-grained IAM roles.
- Implement IAM least privilege for S3 buckets, databases, queues.
- Add image moderation via Rekognition / Vision API pipeline before publishing.
- Maintain audit logs for authentication events and operations actions.

## 10. Local & Staging Environments
- Use Docker Compose to emulate essential services locally (Auth, Gallery, Redis, LocalStack).
- Staging environment mirrors production topology with smaller instance sizes, automated smoke tests post-deploy.

## 11. Cost & Optimization Considerations
- Enable autoscaling down to minimum replicas during off-peak hours.
- Adopt serverless options (Lambda for lightweight endpoints, Aurora Serverless) where latency budgets allow.
- Continuously profile and eliminate cold paths from the SPA bundle to reduce CDN and compute overhead.
