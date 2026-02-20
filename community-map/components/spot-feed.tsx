"use client";

import { useEffect, useState } from "react";
import { getSpots } from "@/app/actions";
import { SpotCard } from "@/components/spot-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Basic Haversine formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export function SpotFeed({ initialSpots }: { initialSpots: any[] }) {
    const [spots, setSpots] = useState(initialSpots);
    const [filteredSpots, setFilteredSpots] = useState(initialSpots);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [filterMode, setFilterMode] = useState<"all" | "near">("all");
    const [searchPref, setSearchPref] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Attempt to get location on mount for "Near Me" feature accessibility
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
        }
    }, []);

    useEffect(() => {
        let result = [...spots];

        // Filter by Prefecture
        if (searchPref) {
            result = result.filter(spot => spot.prefecture.includes(searchPref));
        }

        // Filter by Distance (10km) if mode is 'near' and location exists
        if (filterMode === "near" && userLocation) {
            result = result.map(spot => ({
                ...spot,
                _distance: getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, spot.lat, spot.lng)
            }))
                .filter(spot => spot._distance <= 10)
                .sort((a, b) => a._distance - b._distance);
        } else {
            // Default Sort: Newest
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setFilteredSpots(result);
    }, [spots, filterMode, userLocation, searchPref]);

    const toggleSort = () => {
        if (filterMode === "all") {
            if (!userLocation) {
                alert("位置情報を取得できませんでした");
                return;
            }
            setFilterMode("near");
        } else {
            setFilterMode("all");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2 mb-4">
                <Input
                    placeholder="都道府県で検索 (例: 東京)"
                    value={searchPref}
                    onChange={(e) => setSearchPref(e.target.value)}
                    className="flex-1"
                />
                <Button
                    variant={filterMode === "near" ? "default" : "outline"}
                    onClick={toggleSort}
                >
                    {filterMode === "near" ? "10km圏内解除" : "近くを探す"}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSpots.map((spot) => (
                    <SpotCard
                        key={spot.id}
                        spot={spot}
                        distance={spot._distance}
                    />
                ))}
                {filteredSpots.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                        該当するスポットが見つかりません
                    </div>
                )}
            </div>
        </div>
    );
}
