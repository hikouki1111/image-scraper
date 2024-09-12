const selectedSet = new Set();
let zip = new JSZip();

function main() {
    selectedSet.clear();
    zip = new JSZip()

    const filterElement = document.getElementById("filter");
    let filter = "";
    filterElement.addEventListener("input", () => {
        filter = filterElement.value;
        update(filter);
    });
    update(filter);

    const asZipElement = document.getElementById("as-zip");
    browser.runtime.sendMessage({ action: "getIsAsZip" }).then((response) => {
        asZipElement.checked = response.asZip.asZip;
    });

    asZipElement.addEventListener("change", () => {
        browser.runtime.sendMessage({ action: "setIsAsZip", value: asZipElement.checked })
            .catch(error => {
                console.error(error);
            });
    });

    document.getElementById("download-button").addEventListener("click", () => {
        if (selectedSet.size != 0) {
            zipFiles()
                .then(() => zip.generateAsync({type: "blob"}))
                .then(content => {
                    if (asZipElement.checked) {
                        const zipUrl = URL.createObjectURL(content);
                        browser.downloads.download({
                            url: zipUrl,
                            filename: "images.zip"
                        })
                    } else {
                        downloadAsync();
                    }
                });
        }
    });

    const globalCheckbox = document.getElementById("global-checkbox");
    globalCheckbox.addEventListener("change", () => {
        const allCheckboxElement = document.getElementsByClassName("checkbox");
        Array.from(allCheckboxElement).forEach((element) => {
            element.checked = globalCheckbox.checked;
            element.dispatchEvent(new Event('change'));
        });
    });
}

function update(filter) {
    browser.runtime.sendMessage({ action: "getImageSrc" }).then((response) => {
        if (response.action === "sendImageSrc") {
            const images = [...new Set(response.imageSrc)]
                .filter(src => filter === "" || includesIgnoreCase(src, filter));
            const containerElement = document.getElementById("image-container");
            containerElement.innerHTML = "";
            const counterElement = document.getElementById("counter");
            counterElement.innerHTML = String(images.length).concat(" images");
            
            for (let i = 0; i < images.length; i++) {
                const index = String(i);
                const itemElement = document.createElement("div");
                itemElement.style.display = "flex";

                const checkBoxElement = document.createElement("input");
                checkBoxElement.type = "checkbox";
                checkBoxElement.id = images[i];
                checkBoxElement.classList.add("checkbox");
                itemElement.appendChild(checkBoxElement);

                const imgElement = document.createElement("img");
                imgElement.id = "img".concat(index);
                imgElement.src = images[i];
                itemElement.appendChild(imgElement);

                containerElement.appendChild(itemElement);
            }

            const checkBoxElement = document.getElementsByClassName("checkbox");
            Array.from(checkBoxElement).forEach(element => {
                element.addEventListener("change", () => {
                    if (element.checked) {
                        selectedSet.add(element.id);
                    } else {
                        selectedSet.delete(element.id);
                    }
                });
            });
        }
    }).catch((error) => {
        console.error(error);
    });
}

function includesIgnoreCase(string1, string2) {
    return string1.toLowerCase().includes(string2.toLowerCase());
}

function getFileName(url) {
    const pathname = new URL(url).pathname;
    return pathname.substring(pathname.lastIndexOf('/') + 1);
}

function fixExt(blob, filename) {
    return extensionMap[blob.type] || filename;
}

function getImageAsBlob(url) {
    return fetch(url)
        .then(response => response.blob())
        .then(blob => {
            return blob;
        });
}

const extensionMap = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/bmp": ".bmp",
    "image/tiff": ".tiff",
    "image/x-icon": ".ico",
    "image/heif": ".heif",
    "image/heic": ".heic",
    "image/avif": ".avif",
    "image/jp2": ".jp2"
};

function zipFiles() {
    const promise = Array.from(selectedSet).map(async (src) => {
        try {
            const blob = await getImageAsBlob(src);
            const filename = randomString(10) + fixExt(blob, getFileName(src));
            zip.file(filename, blob);
        } catch (error) {
            console.error(error);
        }
    });

    return Promise.all(promise);
}

function downloadAsync() {
    const promise = Array.from(selectedSet).map(async (src) => {
        try {
            const blob = await getImageAsBlob(src);
            const filename = randomString(10) + fixExt(blob, getFileName(src));
            browser.downloads.download({
                url: src,
                filename: filename
            });
        } catch (error) {
            console.error(error);
        }
    });

    return Promise.all(promise);
}

main();