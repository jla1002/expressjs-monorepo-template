/*
  Warnings:

  - You are about to drop the column `session_id` on the `onboarding_submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "onboarding_submission" DROP COLUMN IF EXISTS "session_id";