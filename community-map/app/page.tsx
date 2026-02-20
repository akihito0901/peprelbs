import { SiteHeader } from "@/components/site-header";
import { PostForm } from "@/components/post-form";
import { SpotFeed } from "@/components/spot-feed";
import { getSpots } from "@/app/actions";

export default async function Home() {
    // Initial data fetch on server
    const initialSpots = await getSpots();

    return (
        <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 container py-6 max-w-4xl mx-auto">

                <section id="post" className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 tracking-tight">スポットをシェアする</h2>
                    <PostForm />
                </section>

                <section id="feed">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">みんなの投稿</h2>
                        <span className="text-sm text-muted-foreground">{initialSpots.length}件のスポット</span>
                    </div>
                    <SpotFeed initialSpots={initialSpots} />
                </section>

            </main>
        </div>
    );
}
