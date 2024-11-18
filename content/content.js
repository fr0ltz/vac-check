chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startCheck") {
        // Select all friend cards with Steam IDs
        const friends = document.querySelectorAll("[data-steamid]");
        if (friends.length === 0) {
            console.warn("No friends found on the page.");
        }

        // Collect all Steam IDs
        const steamIds = Array.from(friends).map(friend => friend.getAttribute("data-steamid"));

        // If no Steam IDs found, log and exit
        if (steamIds.length === 0) {
            console.warn("No Steam IDs collected.");
        }

        // Send IDs to the background script for processing
        chrome.runtime.sendMessage({ type: "checkSteamBans", steamIds }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError);
            } else {
                if (response && response.results) {
                    response.results.forEach(player => {
                        const friendElement = document.querySelector(`[data-steamid="${player.SteamId}"]`);
                        if (friendElement) {
                            const statusElement = friendElement.querySelector(".friend_block_content .friend_small_text");
                            const lastOnline = friendElement.querySelector(".friend_block_content .friend_last_online_text");
                            const overlayTooltip = friendElement.querySelector(".selectable_overlay");
                            if (statusElement) {
                                if (lastOnline) {
                                    lastOnline.remove();
                                }
                                if (player.NumberOfVACBans > 0) {
                                    statusElement.style.color = "#da2525";
                                    statusElement.textContent = `${player.NumberOfVACBans} VAC ban${player.NumberOfVACBans > 1 ? "s" : ""} on record!`;
                                    overlayTooltip.setAttribute("title", `${player.NumberOfVACBans} VAC ban${player.NumberOfVACBans > 1 ? "s" : ""} on record - ${player.DaysSinceLastBan} day(s) since last ban.`);
                                } else {
                                    statusElement.textContent = "No VAC ban on record.";
                                    overlayTooltip.setAttribute("title", "No VAC ban on record.");
                                }
                            }
                        }
                    });
                }
            }
        });
    }
});