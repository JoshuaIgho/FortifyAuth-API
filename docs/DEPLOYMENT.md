# FortifyAuth Enterprise Production Deployment Manual

This document provides step-by-step instructions to deploy FortifyAuth inside high-availability Kubernetes or Docker Swarm computing environments.

---

## 1. Container Building Process

We utilize an optimized multi-stage secure Docker blueprint to package the runtime environment, producing an image size of <150MB:

```dockerfile
# stage 1: compiler engine
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ ./src
COPY prisma/ ./prisma
RUN npx prisma generate
RUN npm run build

# stage 2: production runtime
FROM node:20-alpine AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
RUN npx prisma generate

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

---

## 2. Horizontal Scaling Topology (Kubernetes Manifest)

To handle massive computational volume, we deploy the engine pod under an automated horizontal scaler:

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fortifyauth-engine
  namespace: security
  labels:
    app: fortifyauth-engine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fortifyauth-engine
  template:
    metadata:
      labels:
        app: fortifyauth-engine
    spec:
      containers:
      - name: engine
        image: gcr.io/fortifyauth/engine:v1.4.2
        ports:
        - containerPort: 3000
        resources:
          limits:
            cpu: "1"
            memory: 1Gi
          requests:
            cpu: "250m"
            memory: 512Mi
        envFrom:
        - secretRef:
            name: fortifyauth-secrets
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: fortifyauth-asg
  namespace: security
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: fortifyauth-engine
  minReplicas: 3
  maxReplicas: 30
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## 3. Persistent Storage Provisioning

* **Amazon Aurora PostgreSQL**: Run inside database subnets spanning 3 Availability Zones, structured with auto-promoting read-replicas.
* **Elasticache Redis**: Arranged as a replication group with Cluster Mode Enabled to guarantee failproof caching transactions.
