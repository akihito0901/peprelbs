"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getSpots() {
    try {
        const spots = await prisma.spot.findMany({
            orderBy: {
                createdAt: "desc",
            },
            take: 100, // Limit to 100 for now
        });
        return spots;
    } catch (error) {
        console.error("Failed to fetch spots:", error);
        return [];
    }
}

export async function createSpot(data: {
    name: string;
    url?: string;
    address: string;
    prefecture: string;
    lat: number;
    lng: number;
    review: string;
    category: string;
    images: string[];
}) {
    try {
        await prisma.spot.create({
            data: {
                name: data.name,
                url: data.url,
                address: data.address,
                prefecture: data.prefecture,
                lat: data.lat,
                lng: data.lng,
                review: data.review,
                category: data.category,
                images: data.images,
            },
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to create spot:", error);
        return { success: false, error: "Failed to create spot" };
    }
}
