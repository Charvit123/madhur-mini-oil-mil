# Madhur Mini Oil Mill — full stack

```
web/       Next.js 15 storefront + admin (see web/README.md)
backend/   Spring Boot 4 catalogue + orders + Razorpay + OTP auth (see backend/README.md)
```

## Fastest path to seeing it run

**Frontend only, zero setup** (uses its own mock API routes):
```bash
cd web && npm install && npm run dev
```

**Full stack, real backend**:
```bash
cd backend && docker compose up -d db && cp .env.example .env
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# new terminal
cd web
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" >> .env.local
npm install && npm run dev
```

Both sides speak the same JSON contract (`backend/.../dto/*.java` ↔
`web/lib/types.ts`), so pointing the frontend at the real backend is the one
env var above — no component changes either way.
