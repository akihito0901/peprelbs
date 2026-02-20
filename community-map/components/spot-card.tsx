import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import Image from "next/image";

type Spot = {
    id: string;
    name: string;
    address: string;
    prefecture: string;
    review: string;
    category: string;
    images: string[];
    lat: number;
    lng: number;
    url: string | null;
};

export function SpotCard({ spot, distance }: { spot: Spot; distance?: number }) {
    return (
        <Card className="overflow-hidden">
            {spot.images.length > 0 && (
                <div className="relative h-48 w-full">
                    {/* Note: Using standard img tag for simplicity in copy-paste setup, 
               Use next/image if domains configured in next.config.js */}
                    <img
                        src={spot.images[0]}
                        alt={spot.name}
                        className="h-full w-full object-cover"
                    />
                </div>
            )}
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2 font-bold">
                            {spot.category}
                        </span>
                        <CardTitle className="text-lg">{spot.name}</CardTitle>
                    </div>
                    {distance !== undefined && (
                        <div className="text-sm font-bold text-orange-500">
                            {distance.toFixed(1)}km
                        </div>
                    )}
                </div>
                <p className="text-sm text-gray-500 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" /> {spot.address}
                </p>
            </CardHeader>
            <CardContent className="pb-2">
                <p className="text-sm text-gray-700 line-clamp-3">{spot.review}</p>
            </CardContent>
            <CardFooter className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Navigation className="h-4 w-4 mr-2" />
                        ここへ行く
                    </a>
                </Button>
                {spot.url && (
                    <Button variant="secondary" size="sm" className="flex-1" asChild>
                        <a href={spot.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" /> 公式HP
                        </a>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
