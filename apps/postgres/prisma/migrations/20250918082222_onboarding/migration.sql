-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'MANAGER', 'USER', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."CaseStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "preferred_locale" TEXT NOT NULL DEFAULT 'en',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."case" (
    "id" TEXT NOT NULL,
    "case_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."CaseStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "assigned_to_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "storage_url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."case_note" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."onboarding_submission" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "address_line_1" TEXT NOT NULL,
    "address_line_2" TEXT,
    "town" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "role_type" TEXT NOT NULL,
    "role_other" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_id" TEXT,

    CONSTRAINT "onboarding_submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_session_token_key" ON "public"."user_session"("token");

-- CreateIndex
CREATE INDEX "user_session_token_idx" ON "public"."user_session"("token");

-- CreateIndex
CREATE INDEX "user_session_user_id_idx" ON "public"."user_session"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "case_case_number_key" ON "public"."case"("case_number");

-- CreateIndex
CREATE INDEX "case_case_number_idx" ON "public"."case"("case_number");

-- CreateIndex
CREATE INDEX "case_status_idx" ON "public"."case"("status");

-- CreateIndex
CREATE INDEX "case_assigned_to_id_idx" ON "public"."case"("assigned_to_id");

-- CreateIndex
CREATE INDEX "document_case_id_idx" ON "public"."document"("case_id");

-- CreateIndex
CREATE INDEX "case_note_case_id_idx" ON "public"."case_note"("case_id");

-- CreateIndex
CREATE INDEX "onboarding_submission_submitted_at_idx" ON "public"."onboarding_submission"("submitted_at");

-- AddForeignKey
ALTER TABLE "public"."user_session" ADD CONSTRAINT "user_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case" ADD CONSTRAINT "case_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document" ADD CONSTRAINT "document_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case_note" ADD CONSTRAINT "case_note_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
