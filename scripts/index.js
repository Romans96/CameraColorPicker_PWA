import { Sleep } from "./utils/sleep.js";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

let colorDatabase = null;


// Funzione per calcolare la distanza tra due colori
function getCommonColorName(r, g, b) {
    if (colorDatabase.length === 0) return "Caricamento...";

    let minDistance = Infinity;
    let closest = null;

    colorDatabase.forEach(color => {
        // Distanza Euclidea pesata (l'occhio umano percepisce meglio il verde)
        // Se vuoi semplicità usa quella standard, altrimenti questa è più precisa:
        const d = Math.sqrt(
            Math.pow((r - color.rgb["r"]) * 0.30, 2) +
            Math.pow((g - color.rgb["g"]) * 0.59, 2) +
            Math.pow((b - color.rgb["b"]) * 0.11, 2)
        );

        if (d < minDistance) {
            minDistance = d;
            closest = color;
        }
    });

    // Se la distanza è minima, siamo sicuri del colore
    // Se d > 100 (valore indicativo), il colore è molto diverso da quelli in lista
    return closest.name;
}

// Attiva la fotocamera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
        });
        
        video.srcObject = stream;

        // Non fare play() subito! Aspetta che il browser sia pronto
        video.onloadedmetadata = async () => {
            try {
                await video.play();
                console.log("Camera avviata con successo");
            } catch (playError) {
                console.error("Play interrotto:", playError);
            }
        };
    } catch (err) {
        alert("Errore camera: " + err);
    }
}

async function analyzeColor() {
    if (video.paused || video.ended || video.readyState < 2) {
        requestAnimationFrame(analyzeColor);
        return;
    }

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

        const colorName = getCommonColorName(r,g,b)

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

(async () => {
    video.addEventListener("play", () => {
    requestAnimationFrame(analyzeColor);
});
    await fetch("./datasets/colors.json")
        .then(res => res.json())
        .then(data => colorDatabase = data.colors);

    console.log(colorDatabase)

    await startCamera();
})()

