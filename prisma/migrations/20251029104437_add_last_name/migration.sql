/*
  Warnings:

  - You are about to drop the column `age` on the `UserModel` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `UserModel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserModel" DROP COLUMN "age",
DROP COLUMN "fullName",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;
