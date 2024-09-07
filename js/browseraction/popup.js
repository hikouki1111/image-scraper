const selectedSet = new Set();

function main() {
    selectedSet.clear();

    const filterElement = document.getElementById("filter");
    let filter = "";
    filterElement.addEventListener("input", function() {
        filter = filterElement.value;
        update(filter);
    });

    update(filter);

    document.getElementById("download-button").addEventListener("click", function() {
        if (selectedSet.size != 0) {
            selectedSet.forEach(src => {
                browser.downloads.download({
                    url: src,
                    filename: getFileName(src)
                });
            });
        }
    });

    const globalCheckbox = document.getElementById("global-checkbox");
    globalCheckbox.addEventListener("change", function() {
        const allCheckboxElement = document.getElementsByClassName("checkbox");
        Array.from(allCheckboxElement).forEach((element) => {
            element.checked = globalCheckbox.checked;
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
                element.addEventListener("change", function() {
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

main();