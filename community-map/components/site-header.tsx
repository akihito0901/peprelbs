import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="font-bold sm:inline-block text-xl tracking-tight">
                            PepMap <span className="text-xs text-muted-foreground font-normal">by Pepre</span>
                        </span>
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <nav className="flex items-center space-x-1">
                        <Button size="sm" asChild>
                            <a href="#post">投稿する</a>
                        </Button>
                    </nav>
                </div>
            </div>
        </header>
    );
}
