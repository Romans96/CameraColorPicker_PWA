import { Sleep } from "./utils/sleep.js";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const colorDatabase = [
    { name: "Bianco", rgb: [255, 255, 255] },
    { name: "Nero", rgb: [0, 0, 0] },
    { name: "Rosso", rgb: [255, 0, 0] },
    { name: "Verde", rgb: [0, 255, 0] },
    { name: "Blu", rgb: [0, 0, 255] },
    { name: "Giallo", rgb: [255, 255, 0] },
    { name: "Arancione", rgb: [255, 165, 0] },
    { name: "Viola", rgb: [128, 0, 128] },
    { name: "Grigio", rgb: [128, 128, 128] }
];

// Funzione per calcolare la distanza tra due colori
function getColorName(r, g, b) {
    let closestColor = colorDatabase[0];
    let minDistance = Infinity;

    colorDatabase.forEach(color => {
        // Formula della distanza euclidea 3D
        const distance = Math.sqrt(
            Math.pow(r - color.rgb[0], 2) +
            Math.pow(g - color.rgb[1], 2) +
            Math.pow(b - color.rgb[2], 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestColor = color;
        }
    });

    return closestColor.name;
}

// Attiva la fotocamera
async function startCamera() {
    try {
        console.log("Start camera");
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
        });
        video.srcObject = stream;
    } catch (err) {
        alert("Errore accesso fotocamera: " + err);
    }
}

async function analyzeColor() {
    await Sleep(200);
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        const pixel = ctx.getImageData(x, y, 1, 1).data;

        const r = pixel[0],
            g = pixel[1],
            b = pixel[2];
        const hex =
            "#" +
            ((1 << 24) + (r << 16) + (g << 8) + b)
                .toString(16)
                .slice(1)
                .toUpperCase();

        // console.log(hex)
        // const color = ntc.name(hex);
        // alert(color)

        const colorName = getColorName(r,g,b)

        document.getElementById("colorBox").style.backgroundColor = hex;
        document.getElementById("colorHex").innerText = hex;
        // Qui potresti aggiungere la libreria NTC.js per il nome
        // document.getElementById("colorName").innerText = `RGB(${r},${g},${b})`;
        document.getElementById("colorName").innerText = colorName
    }
    requestAnimationFrame(analyzeColor);
}

// Registra Service Worker per PWA
// if ("serviceWorker" in navigator) {
//     navigator.serviceWorker.register("sw.js");
// }

video.addEventListener("play", () => {
    requestAnimationFrame(analyzeColor);
});

startCamera();
