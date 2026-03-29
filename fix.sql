
model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt(sort: Desc)])
}

model CoopSession {
  id           String             @id @default(cuid())
  inviteCode   String             @unique
  name         String
  status       String             @default("ACTIVE") // ACTIVE, COMPLETED, CANCELLED
  totalXp      Int                @default(0)
  goalXp       Int                @default(1000)
  createdAt    DateTime           @default(now())
  endedAt      DateTime?
  
  members      CoopSessionMember[]
}

model CoopSessionMember {
  id             String      @id @default(cuid())
  sessionId      String
  userId         String
  xpContributed  Int         @default(0)
  status         String      @default("IDLE") // LIFTING, RESTING, IDLE, COMPLETED
  currentExercise String?
  prsCount       Int         @default(0)
  volume         Float       @default(0)
  penalties      Int         @default(0)
  joinedAt       DateTime    @default(now())

  session        CoopSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user           User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([sessionId, userId])
  @@index([sessionId])
}
