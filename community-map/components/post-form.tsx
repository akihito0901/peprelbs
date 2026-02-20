"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase";
import { createSpot } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Image as ImageIcon } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(1, "スポット名は必須です"),
    url: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
    address: z.string().min(1, "住所は必須です"),
    prefecture: z.string().min(1, "都道府県は必須です"),
    review: z.string().min(1, "口コミを入力してください"),
    category: z.string().min(1, "カテゴリを選択してください"),
});

export function PostForm() {
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [geoLoading, setGeoLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            url: "",
            address: "",
            prefecture: "",
            review: "",
            category: "other",
        },
    });

    const getLocation = () => {
        if (!navigator.geolocation) {
            alert("お使いのブラウザは位置情報をサポートしていません");
            return;
        }

        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });

                // Reverse Geocoding (Using Google Maps Geocoding API if key exists, otherwise manual input)
                // Note: In client-side logic without key, we might ask user to input address or try open API.
                // Here assuming we fetch from a Next.js API route or just setting lat/lng and asking User to fill address for now
                // to keep it simple as standard Geocoding API requires billing.
                // Ideally: fetch(\`https://maps.googleapis.com/maps/api/geocode/json?latlng=\${latitude},\${longitude}&key=YOUR_KEY\`)

                // For this demo, let's simulate or try to fetch if key is present, else just prompt.
                // We will just alert the user to fill the address for accuracy in this 'copy-paste' version unless we set up the API route.
                // But the requirement says "Auto extract".
                // Let's implement a simple fetch if the key is exposed in env (Next public).
                const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
                if (apiKey) {
                    try {
                        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=ja`);
                        const data = await res.json();
                        if (data.results && data.results[0]) {
                            const addressComponents = data.results[0].address_components;
                            let prefecture = "";
                            let fullAddress = data.results[0].formatted_address;

                            // Extract prefecture
                            addressComponents.forEach((comp: any) => {
                                if (comp.types.includes("administrative_area_level_1")) {
                                    prefecture = comp.long_name;
                                }
                            });

                            // Remove "Japan" from address if present
                            fullAddress = fullAddress.replace(/^日本、/, "");

                            form.setValue("address", fullAddress);
                            form.setValue("prefecture", prefecture);
                        }
                    } catch (e) {
                        console.error("Geocoding failed", e);
                    }
                }

                setGeoLoading(false);
            },
            (error) => {
                console.error(error);
                alert("位置情報の取得に失敗しました");
                setGeoLoading(false);
            }
        );
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const compressedFiles: File[] = [];
            const newPreviews: string[] = [];

            for (const file of files) {
                if (compressedFiles.length >= 5) break;

                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true,
                };

                try {
                    const compressedFile = await imageCompression(file, options);
                    compressedFiles.push(compressedFile);
                    newPreviews.push(URL.createObjectURL(compressedFile));
                } catch (error) {
                    console.error("Compression failed", error);
                }
            }

            setImageFiles(compressedFiles);
            setPreviewUrls(newPreviews);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!location) {
            alert("位置情報を取得してください");
            return;
        }
        setLoading(true);

        try {
            const imageUrls: string[] = [];

            // Upload images to Supabase Storage
            for (const file of imageFiles) {
                const fileName = `${Date.now()}-${file.name}`;
                const { data, error } = await supabase.storage
                    .from("spots") // Bucket name
                    .upload(fileName, file);

                if (error) throw error;

                const { data: publicUrlData } = supabase.storage
                    .from("spots")
                    .getPublicUrl(fileName);

                imageUrls.push(publicUrlData.publicUrl);
            }

            const result = await createSpot({
                ...values,
                lat: location.lat,
                lng: location.lng,
                images: imageUrls,
            });

            if (result.success) {
                alert("投稿しました！");
                form.reset();
                setImageFiles([]);
                setPreviewUrls([]);
                setLocation(null);
            } else {
                alert("投稿に失敗しました");
            }
        } catch (error) {
            console.error(error);
            alert("エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>新しいスポットを投稿</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={getLocation}
                        disabled={geoLoading}
                    >
                        {geoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                        現在地から住所を自動入力
                    </Button>

                    <div className="grid gap-2">
                        <Label htmlFor="category">カテゴリ</Label>
                        <select
                            {...form.register("category")}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="cafe">ドッグカフェ</option>
                            <option value="run">ドッグラン</option>
                            <option value="hotel">ペットホテル</option>
                            <option value="other">その他</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">スポット名</Label>
                        <Input {...form.register("name")} placeholder="例: わんわんカフェ" />
                        {form.formState.errors.name && <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="url">公式サイトURL (任意)</Label>
                        <Input {...form.register("url")} placeholder="https://..." />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">住所</Label>
                        <Input {...form.register("address")} placeholder="自動入力または手入力" />
                        {form.formState.errors.address && <p className="text-red-500 text-sm">{form.formState.errors.address.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="prefecture">都道府県</Label>
                        <Input {...form.register("prefecture")} placeholder="例: 東京都" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="review">口コミ</Label>
                        <Textarea {...form.register("review")} placeholder="愛犬と行ってみた感想をシェアしよう！" />
                        {form.formState.errors.review && <p className="text-red-500 text-sm">{form.formState.errors.review.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label>写真 (最大5枚)</Label>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                id="image-upload"
                                onChange={handleImageChange}
                            />
                            <Label htmlFor="image-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                <ImageIcon className="mr-2 h-4 w-4" /> 画像を選択
                            </Label>
                            <span className="text-sm text-gray-500">{imageFiles.length}枚選択中</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto py-2">
                            {previewUrls.map((url, index) => (
                                <img key={index} src={url} alt="preview" className="h-20 w-20 object-cover rounded-md" />
                            ))}
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "投稿する"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
