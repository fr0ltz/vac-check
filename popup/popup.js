document.addEventListener("DOMContentLoaded", () => {
    const apiKeyInputDiv = document.getElementById("apiKeyInput");
    const actionButtonsDiv = document.getElementById("actionButtons");
    const saveKeyButton = document.getElementById("saveKey");
    const startCheckButton = document.getElementById("startCheck");
    const resetKeyButton = document.getElementById("resetKey");
    const warning = document.getElementById("warning");
    const regEx = /^https:\/\/steamcommunity\.com\/id\/.*\/friends$/;

    // Function to check the current tab's URL and toggle visibility.
    function checkCurrentPage() {
        getCurrentTabUrl((url) => {
            if (regEx.test(url)) {
                // On the friends page, hide the warning and show action buttons (if API key exists).
                warning.classList.add("hidden");
                chrome.storage.local.get("steamApiKey", data => {
                    if (data.steamApiKey) {
                        actionButtonsDiv.classList.remove("hidden");
                    } else {
                        actionButtonsDiv.classList.add("hidden");
                    }
                });
            } else {
                // Not on the friends page, show the warning and hide action buttons.
                warning.classList.remove("hidden");
                actionButtonsDiv.classList.add("hidden");
            }
        });
    }

    // Initial API key and page state check.
    chrome.storage.local.get("steamApiKey", data => {
        if (data.steamApiKey) {
            console.log("Steam API Key Found.");
            apiKeyInputDiv.classList.add("hidden");
            actionButtonsDiv.classList.remove("hidden");
            checkCurrentPage(); // Check the current page URL after loading.
        } else {
            console.log("Steam API Key Not Found.");
            apiKeyInputDiv.classList.remove("hidden");
            actionButtonsDiv.classList.add("hidden");
            warning.classList.add("hidden");
        }
    });

    // Save the API key and recheck the page state.
    saveKeyButton.addEventListener("click", () => {
        const apiKey = document.getElementById("apiKey").value.trim();
        if (apiKey) {
            chrome.storage.local.set({ steamApiKey: apiKey }, () => {
                console.log("API key saved!");
                apiKeyInputDiv.classList.add("hidden");
                checkCurrentPage(); // Recheck the page state after saving the key.
            });
        } else {
            alert("Please enter a valid API key.");
        }
    });

    // Function to get the current tab's URL.
    function getCurrentTabUrl(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const currentTab = tabs[0];
            if (currentTab && currentTab.url) {
                callback(currentTab.url);
            } else {
                console.error("Unable to retrieve the current tab's URL.");
                callback(""); // Send an empty string to prevent crashes.
            }
        });
    }

    // Start the check
    startCheckButton.addEventListener("click", async () => {
        console.log("Start Check button clicked.");
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.tabs.sendMessage(tab.id, { action: "startCheck" });
        window.close();
    });

    // Reset the API key
    resetKeyButton.addEventListener("click", () => {
        chrome.storage.local.remove("steamApiKey", () => {
            console.log("API key reset.");
            apiKeyInputDiv.classList.remove("hidden");
            actionButtonsDiv.classList.add("hidden");
        });
    });
});
