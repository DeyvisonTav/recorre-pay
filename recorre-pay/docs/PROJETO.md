# RecorrePay - Gerenciador de Mensalidades

## Visão Geral

**Nome:** RecorrePay

**Descrição:** SaaS multi-tenant para profissionais autônomos e pequenas empresas gerenciarem cobranças recorrentes de mensalidades de seus clientes.

**Proposta de Valor:** "Cobre seus clientes todo mês automaticamente, sem planilhas, sem dor de cabeça."

**Público-alvo:**
- Personal trainers
- Nutricionistas
- Psicólogos
- Dentistas
- Professores particulares
- Academias pequenas
- Estúdios (pilates, cross, dança)
- Freelancers com contrato mensal

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Vite + React + TypeScript + TailwindCSS |
| Backend | NestJS + TypeScript + Prisma |
| Banco | PostgreSQL (Docker) |
| Pagamentos | Stripe |
| Containerização | Docker + Docker Compose |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│              Vite + React + TailwindCSS                      │
│                     (porta 5173)                             │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/REST
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│                   NestJS + Prisma                            │
│                     (porta 3000)                             │
├─────────────────────┬───────────────────────────────────────┤
│                     │                                        │
│    ┌────────────────▼────────────────┐                      │
│    │         PostgreSQL              │                      │
│    │          (porta 5432)           │                      │
│    └─────────────────────────────────┘                      │
│                     │                                        │
│    ┌────────────────▼────────────────┐                      │
│    │      Stripe Webhooks            │                      │
│    │   (pagamentos/assinaturas)      │                      │
│    └─────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Entidades do Banco (Prisma Schema)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== TENANT (Multi-tenant) ====================
model Tenant {
  id        String   @id @default(uuid())
  name      String   // Nome do negócio
  slug      String   @unique // URL única
  email     String   @unique
  phone     String?

  // Stripe
  stripeCustomerId     String?  @unique
  stripeAccountId      String?  @unique // Stripe Connect (futuro)

  // Configurações
  defaultDueDay        Int      @default(10) // Dia padrão de vencimento
  reminderDaysBefore   Int      @default(3)  // Dias antes para lembrete

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users     User[]
  customers Customer[]
  plans     Plan[]

  @@map("tenants")
}

// ==================== USUÁRIO (quem opera o sistema) ====================
model User {
  id        String   @id @default(uuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name      String
  email     String
  password  String   // Hash bcrypt
  role      UserRole @default(OWNER)

  isActive  Boolean  @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([tenantId, email])
  @@map("users")
}

enum UserRole {
  OWNER
  ADMIN
  VIEWER
}

// ==================== CLIENTE (quem paga mensalidade) ====================
model Customer {
  id        String   @id @default(uuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name      String
  email     String
  phone     String   // WhatsApp
  document  String?  // CPF/CNPJ

  // Stripe
  stripeCustomerId String? @unique

  notes     String?
  isActive  Boolean  @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  subscriptions Subscription[]
  payments      Payment[]

  @@unique([tenantId, email])
  @@index([tenantId])
  @@map("customers")
}

// ==================== PLANO (modelo de cobrança) ====================
model Plan {
  id        String   @id @default(uuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name        String    // Ex: "Plano Mensal", "Personal 3x/semana"
  description String?
  price       Decimal   @db.Decimal(10, 2)
  currency    String    @default("BRL")

  // Stripe
  stripePriceId   String? @unique
  stripeProductId String?

  interval      BillingInterval @default(MONTHLY)
  intervalCount Int             @default(1)

  isActive  Boolean  @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  subscriptions Subscription[]

  @@index([tenantId])
  @@map("plans")
}

enum BillingInterval {
  WEEKLY
  MONTHLY
  YEARLY
}

// ==================== ASSINATURA (vínculo cliente + plano) ====================
model Subscription {
  id         String   @id @default(uuid())
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  planId     String
  plan       Plan     @relation(fields: [planId], references: [id])

  // Stripe
  stripeSubscriptionId String? @unique

  status     SubscriptionStatus @default(ACTIVE)

  dueDay     Int      // Dia do vencimento (1-28)

  startDate  DateTime @default(now())
  endDate    DateTime?
  canceledAt DateTime?

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  payments   Payment[]

  @@index([customerId])
  @@index([status])
  @@map("subscriptions")
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  CANCELED
  PAST_DUE
}

// ==================== PAGAMENTO (registro de cada cobrança) ====================
model Payment {
  id             String   @id @default(uuid())
  subscriptionId String
  subscription   Subscription @relation(fields: [subscriptionId], references: [id])
  customerId     String
  customer       Customer @relation(fields: [customerId], references: [id])

  amount         Decimal  @db.Decimal(10, 2)
  currency       String   @default("BRL")

  // Stripe
  stripePaymentIntentId String? @unique
  stripeInvoiceId       String? @unique

  status         PaymentStatus @default(PENDING)

  dueDate        DateTime
  paidAt         DateTime?

  paymentMethod  String?  // card, pix, boleto
  paymentLink    String?  // Link para pagamento manual

  notes          String?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([customerId])
  @@index([subscriptionId])
  @@index([status])
  @@index([dueDate])
  @@map("payments")
}

enum PaymentStatus {
  PENDING
  PAID
  OVERDUE
  CANCELED
  REFUNDED
}

// ==================== NOTIFICAÇÃO (histórico de lembretes) ====================
model Notification {
  id        String   @id @default(uuid())

  type      NotificationType
  channel   NotificationChannel

  recipient String   // Email ou telefone
  subject   String?
  message   String

  status    NotificationStatus @default(PENDING)
  sentAt    DateTime?
  error     String?

  paymentId String?

  createdAt DateTime @default(now())

  @@index([status])
  @@map("notifications")
}

enum NotificationType {
  PAYMENT_REMINDER
  PAYMENT_OVERDUE
  PAYMENT_CONFIRMED
  WELCOME
}

enum NotificationChannel {
  EMAIL
  WHATSAPP
  SMS
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
}
```

---

## API Endpoints

### Auth
```
POST   /auth/register          # Criar conta (tenant + user)
POST   /auth/login             # Login (retorna JWT)
POST   /auth/refresh           # Refresh token
POST   /auth/forgot-password   # Solicitar reset
POST   /auth/reset-password    # Resetar senha
GET    /auth/me                # Dados do usuário logado
```

### Customers
```
GET    /customers              # Listar clientes (com filtros/paginação)
GET    /customers/:id          # Detalhes do cliente
POST   /customers              # Criar cliente
PATCH  /customers/:id          # Atualizar cliente
DELETE /customers/:id          # Remover cliente (soft delete)
GET    /customers/:id/payments # Histórico de pagamentos do cliente
```

### Plans
```
GET    /plans                  # Listar planos
GET    /plans/:id              # Detalhes do plano
POST   /plans                  # Criar plano
PATCH  /plans/:id              # Atualizar plano
DELETE /plans/:id              # Desativar plano
```

### Subscriptions
```
GET    /subscriptions                    # Listar assinaturas
GET    /subscriptions/:id                # Detalhes da assinatura
POST   /subscriptions                    # Criar assinatura
PATCH  /subscriptions/:id                # Atualizar assinatura
POST   /subscriptions/:id/cancel         # Cancelar assinatura
POST   /subscriptions/:id/pause          # Pausar assinatura
POST   /subscriptions/:id/resume         # Reativar assinatura
```

### Payments
```
GET    /payments                         # Listar pagamentos
GET    /payments/:id                     # Detalhes do pagamento
POST   /payments/:id/mark-paid           # Marcar como pago manualmente
POST   /payments/:id/send-reminder       # Enviar lembrete manual
POST   /payments/:id/generate-link       # Gerar link de pagamento
```

### Dashboard
```
GET    /dashboard/summary                # Resumo geral
GET    /dashboard/overdue                # Lista de inadimplentes
GET    /dashboard/upcoming               # Próximos vencimentos (7 dias)
GET    /dashboard/monthly-report         # Relatório mensal simplificado
```

### Webhooks (Stripe)
```
POST   /webhooks/stripe                  # Receber eventos do Stripe
```

### Settings
```
GET    /settings                         # Configurações do tenant
PATCH  /settings                         # Atualizar configurações
POST   /settings/stripe/connect          # Conectar conta Stripe
```

---

## Fluxos Principais

### Fluxo 1: Cadastro de novo cliente com assinatura
1. Usuário clica "Novo Cliente"
2. Preenche: Nome, Email, WhatsApp
3. Seleciona Plano existente (ou cria novo)
4. Define dia de vencimento
5. Sistema cria Customer, Subscription e primeiro Payment

### Fluxo 2: Cobrança recorrente (Stripe automático)
1. Stripe gera Invoice no dia do vencimento
2. Stripe tenta cobrar do cartão cadastrado
3. Webhook atualiza status do Payment

### Fluxo 3: Cobrança manual (link de pagamento)
1. Cron job identifica pagamentos próximos do vencimento
2. Sistema gera Payment Link
3. Envia lembrete com link
4. Cliente paga via link
5. Webhook atualiza status

### Fluxo 4: Inadimplência
1. Cron job identifica payments vencidos
2. Atualiza status para OVERDUE
3. Atualiza Subscription para PAST_DUE
4. Envia notificação de atraso

---

## Comandos para Desenvolvimento

```bash
# Subir ambiente completo
docker-compose up -d

# Rodar migrations
docker-compose exec backend npx prisma migrate dev

# Seed de dados
docker-compose exec backend npx prisma db seed

# Acessar aplicação
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
```

---

## Checklist MVP

### Backend
- [ ] Setup NestJS + Prisma + PostgreSQL
- [ ] Módulo Auth (register, login, JWT)
- [ ] Multi-tenant middleware
- [ ] CRUD Customers
- [ ] CRUD Plans
- [ ] CRUD Subscriptions
- [ ] CRUD Payments
- [ ] Dashboard endpoints
- [ ] Integração Stripe
- [ ] Cron jobs (lembretes, inadimplência)

### Frontend
- [ ] Setup Vite + React + Tailwind
- [ ] Auth pages
- [ ] Layout com sidebar
- [ ] Dashboard
- [ ] CRUD Clientes
- [ ] CRUD Planos
- [ ] Gestão Assinaturas
- [ ] Listagem Pagamentos
- [ ] Configurações

### Infra
- [ ] Docker Compose
- [ ] Scripts de seed
