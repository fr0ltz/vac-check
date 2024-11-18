chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "checkSteamBans") {
        const { steamIds } = request;

        if (!steamIds || steamIds.length === 0) {
            console.warn("No Steam IDs provided.");
            sendResponse({ results: [] });
            return;
        }

        chrome.storage.local.get("steamApiKey", ({ steamApiKey }) => {
            if (!steamApiKey) {
                console.error("Steam API key not found in storage.");
                sendResponse({ error: "Steam API key not found." });
                return;
            }

            const fetchBans = async (steamIds) => {
                const apiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${steamApiKey}&steamids=${steamIds.join(",")}`;

                try {
                    const response = await fetch(apiUrl);
                    const data = await response.json();
                    return data.players;
                } catch (error) {
                    console.error("Error fetching VAC bans:", error);
                    return [];
                }
            };

            const processSteamIdsInBatches = async () => {
                const batchSize = 100;
                const batches = [];

                while (steamIds.length) {
                    batches.push(steamIds.splice(0, batchSize));
                }

                const results = [];
                for (const batch of batches) {
                    const batchResults = await fetchBans(batch);
                    results.push(...batchResults);
                }

                sendResponse({ results });
            };

            processSteamIdsInBatches();
        });

        return true;
    }
});