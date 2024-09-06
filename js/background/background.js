function main() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "getImageSrc") {
            browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
                browser.tabs.executeScript(tabs[0].id, {
                    code: `
                        Array.from(document.querySelectorAll('img')).map(img => img.src);
                    `
                }).then((results) => {
                    sendResponse({ action: "sendImageSrc", imageSrc: results[0] });
                }).catch((error) => {
                    console.error(error);
                });
            });
            
            return true;
        }
    });
}

main();