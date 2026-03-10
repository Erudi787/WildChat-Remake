export default function LobbyHomePage() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="text-center space-y-4 max-w-md">
                <div className="text-6xl mb-4">🐾</div>
                <h1 className="text-3xl font-bold">Welcome to WildChat</h1>
                <p className="text-muted-foreground text-lg">
                    Love Purrs Around Campus
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <p className="text-2xl mb-1">💬</p>
                        <p className="text-sm font-medium">Messages</p>
                        <p className="text-xs text-muted-foreground">Coming in Phase 2</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                        <p className="text-2xl mb-1">👥</p>
                        <p className="text-sm font-medium">Campus Groups</p>
                        <p className="text-xs text-muted-foreground">Coming in Phase 4</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
