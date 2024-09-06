function main() {
    const filterElement = document.getElementById("filter");
    let filter = "";
    filterElement.addEventListener("input", function() {
        filter = filterElement.value;
        update(filter);
    });

    update(filter);
}

function update(filter) {
    browser.runtime.sendMessage({ action: "getImageSrc" }).then((response) => {
        if (response.action === "sendImageSrc") {
            const images = [...new Set(response.imageSrc)].filter(src => filter === "" || includesIgnoreCase(src, filter));
            const containerElement = document.getElementById("image-container");
            containerElement.innerHTML = "";

            const counterElement = document.getElementById("counter");
            counterElement.innerHTML = String(images.length).concat(" images");

            images.forEach((src) => {
                const imgElement = document.createElement("img");
                imgElement.id = "appendedImg";
                imgElement.src = src;
                imgElement.style.width = "50%";
                imgElement.style.height = "auto";
                imgElement.style.filter = "drop-shadow(0px 0px 10px #4c5958";
                imgElement.style.marginBottom = "15px";
                containerElement.appendChild(imgElement);
            });
        }
    }).catch((error) => {
        console.error(error);
    });
}

function includesIgnoreCase(string1, string2) {
    return string1.toLowerCase().includes(string2.toLowerCase());
}

main();