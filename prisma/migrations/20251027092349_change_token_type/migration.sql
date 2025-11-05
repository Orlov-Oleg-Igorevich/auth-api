/*
  Warnings:

  - You are about to alter the column `tokenVersion` on the `UserModel` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "UserModel" ALTER COLUMN "tokenVersion" SET DATA TYPE INTEGER;
