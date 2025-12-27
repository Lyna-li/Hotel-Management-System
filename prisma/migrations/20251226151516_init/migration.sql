-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'EMPLOYEE', 'ADMIN');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED');

-- CreateEnum
CREATE TYPE "RoomTypeEnum" AS ENUM ('SINGLE', 'DOUBLE', 'SUITE');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER');

-- CreateTable
CREATE TABLE "User" (
    "id_user" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "mot_de_passe" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "Client" (
    "id_client" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "date_inscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id_client")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id_employee" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "salaire" DOUBLE PRECISION NOT NULL,
    "date_embauche" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id_employee")
);

-- CreateTable
CREATE TABLE "RoomType" (
    "id_type" SERIAL NOT NULL,
    "nom_type" "RoomTypeEnum" NOT NULL,
    "description" TEXT,

    CONSTRAINT "RoomType_pkey" PRIMARY KEY ("id_type")
);

-- CreateTable
CREATE TABLE "Room" (
    "id_room" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "etage" INTEGER NOT NULL,
    "prix_par_nuit" DOUBLE PRECISION NOT NULL,
    "statut" "RoomStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_type" INTEGER NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id_room")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id_reservation" SERIAL NOT NULL,
    "id_client" INTEGER NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "statut" "ReservationStatus" NOT NULL,
    "validated_by" INTEGER,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id_reservation")
);

-- CreateTable
CREATE TABLE "ReservationRoom" (
    "id_reservation" INTEGER NOT NULL,
    "id_room" INTEGER NOT NULL,

    CONSTRAINT "ReservationRoom_pkey" PRIMARY KEY ("id_reservation","id_room")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id_payment" SERIAL NOT NULL,
    "id_reservation" INTEGER NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "methode" "PaymentMethod" NOT NULL,
    "date_payment" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_by" INTEGER,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id_payment")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id_invoice" SERIAL NOT NULL,
    "id_reservation" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "date_facture" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id_invoice")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Client_id_user_key" ON "Client"("id_user");

-- CreateIndex
CREATE INDEX "Client_id_user_idx" ON "Client"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_id_user_key" ON "Employee"("id_user");

-- CreateIndex
CREATE INDEX "Employee_id_user_idx" ON "Employee"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "RoomType_nom_type_key" ON "RoomType"("nom_type");

-- CreateIndex
CREATE INDEX "Room_statut_idx" ON "Room"("statut");

-- CreateIndex
CREATE INDEX "Room_id_type_idx" ON "Room"("id_type");

-- CreateIndex
CREATE INDEX "Room_numero_idx" ON "Room"("numero");

-- CreateIndex
CREATE INDEX "Reservation_id_client_idx" ON "Reservation"("id_client");

-- CreateIndex
CREATE INDEX "Reservation_statut_idx" ON "Reservation"("statut");

-- CreateIndex
CREATE INDEX "Reservation_date_debut_date_fin_idx" ON "Reservation"("date_debut", "date_fin");

-- CreateIndex
CREATE INDEX "Reservation_validated_by_idx" ON "Reservation"("validated_by");

-- CreateIndex
CREATE INDEX "ReservationRoom_id_room_idx" ON "ReservationRoom"("id_room");

-- CreateIndex
CREATE INDEX "Payment_id_reservation_idx" ON "Payment"("id_reservation");

-- CreateIndex
CREATE INDEX "Payment_received_by_idx" ON "Payment"("received_by");

-- CreateIndex
CREATE INDEX "Payment_methode_idx" ON "Payment"("methode");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_id_reservation_key" ON "Invoice"("id_reservation");

-- CreateIndex
CREATE INDEX "Invoice_date_facture_idx" ON "Invoice"("date_facture");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_id_type_fkey" FOREIGN KEY ("id_type") REFERENCES "RoomType"("id_type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "Client"("id_client") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "Employee"("id_employee") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationRoom" ADD CONSTRAINT "ReservationRoom_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "Reservation"("id_reservation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationRoom" ADD CONSTRAINT "ReservationRoom_id_room_fkey" FOREIGN KEY ("id_room") REFERENCES "Room"("id_room") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "Employee"("id_employee") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "Reservation"("id_reservation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "Reservation"("id_reservation") ON DELETE RESTRICT ON UPDATE CASCADE;
