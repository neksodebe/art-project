const originalCanvas = document.getElementById("originalCanvas");
const shapeCanvas = document.getElementById("shapeCanvas");
const imageUpload = document.getElementById("imageUpload");
const generateBtn = document.getElementById("generate");
const addDetailBtn = document.getElementById("addDetail");
const speedControl = document.getElementById("speedControl");

let originalCtx = originalCanvas.getContext("2d");
let shapeCtx = shapeCanvas.getContext("2d");
let currentShapeSize = 100;
let isGenerating = false;
let imageLoaded = false;

let backgroundColor = {
    r: 0,
    g: 0,
    b: 0,
};

function actuallyLoadImage(e) {
    const img = new Image();
    img.onload = function () {
        const aspectRatio = img.width / img.height;

        // scale canvas based on window size
        shapeCanvas.height = window.innerHeight;
        shapeCanvas.width = shapeCanvas.height * aspectRatio;

        originalCanvas.height = window.innerHeight;
        originalCanvas.width = originalCanvas.height * aspectRatio;

        currentShapeSize = Math.max(img.height, img.width) * 0.4;

        originalCtx.drawImage(
            img,
            0,
            0,
            originalCanvas.width,
            originalCanvas.height,
        );

        const imageData = originalCtx.getImageData(
            0,
            0,
            originalCanvas.width,
            originalCanvas.height,
        );
        const { r, g, b } = getAverageColorForEntireImage(imageData);
        const rgbAverage = (r + g + b) / 3;

        const color = rgbAverage > 256 / 2 ? 232 : 23; // light light light gray or dark gray

        backgroundColor = { r: color, g: color, b: color };

        shapeCtx.fillStyle = `rgb(${color}, ${color}, ${color})`;
        shapeCtx.fillRect(0, 0, shapeCanvas.width, shapeCanvas.height);

        imageLoaded = true;
    };
    img.src = e?.target?.result ?? monaLisaHolyCrap;
}

function loadImage(e, uploaded, file) {
    if (uploaded) {
        const reader = new FileReader();
        reader.onload = actuallyLoadImage;
        reader.readAsDataURL(file);
    } else {
        actuallyLoadImage(e);
    }
}

function loadRandomImage() {
    loadImage();
}

imageUpload.addEventListener("change", function (e) {
    const file = e.target.files[0];

    console.log(e.target.result);
    if (file) {
        loadImage(e, true, file);
    } else {
        loadRandomImage();
    }
});

function getAverageColorForEntireImage(imageData) {
    let r = 0,
        g = 0,
        b = 0,
        count = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
        r += imageData.data[i]; // Red channel
        g += imageData.data[i + 1]; // Green channel
        b += imageData.data[i + 2]; // Blue channel
        count++;
    }

    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
    };
}

function getAverageColor(imageData, x, y, size) {
    let r = 0,
        g = 0,
        b = 0,
        count = 0;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (x + i < imageData.width && y + j < imageData.height) {
                const index = ((y + j) * imageData.width + (x + i)) * 4;
                r += imageData.data[index];
                g += imageData.data[index + 1];
                b += imageData.data[index + 2];
                count++;
            }
        }
    }

    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
    };
}

function getColorDifference(colorA, colorB) {
    return (
        Math.abs(colorA.r - colorB.r) +
        Math.abs(colorA.g - colorB.g) +
        Math.abs(colorA.b - colorB.b)
    );
}

function drawShape(x, y, originalColor) {
    shapeCtx.fillStyle = `rgb(${originalColor.r}, ${originalColor.g}, ${originalColor.b})`;

    const shapeType = Math.floor(Math.random() * 2);
    const scaleFactor = shapeCanvas.width / originalCanvas.width; // Scaling factor based on canvas size

    switch (shapeType) {
        case 0: // rectangle
            const width =
                currentShapeSize * scaleFactor * (0.5 + Math.random() * 0.5);
            const height =
                currentShapeSize * scaleFactor * (0.5 + Math.random() * 0.5);
            shapeCtx.fillRect(x * scaleFactor, y * scaleFactor, width, height);
            break;

        case 1: // circle
            shapeCtx.beginPath();
            shapeCtx.arc(
                x * scaleFactor + (currentShapeSize * scaleFactor) / 2,
                y * scaleFactor + (currentShapeSize * scaleFactor) / 2,
                ((currentShapeSize * scaleFactor) / 2) *
                    (0.5 + Math.random() * 0.5),
                0,
                Math.PI * 2,
            );
            shapeCtx.fill();
            break;

        case 2: // triangle
            shapeCtx.beginPath();
            shapeCtx.moveTo(
                x * scaleFactor + (currentShapeSize * scaleFactor) / 2,
                y * scaleFactor,
            );
            shapeCtx.lineTo(
                x * scaleFactor + currentShapeSize * scaleFactor,
                y * scaleFactor + currentShapeSize * scaleFactor,
            );
            shapeCtx.lineTo(
                x * scaleFactor,
                y * scaleFactor + currentShapeSize * scaleFactor,
            );
            shapeCtx.closePath();
            shapeCtx.fill();
            break;
    }
}

function calculateAttempts(
    shapeSize,
    screenWidth,
    screenHeight,
    fillFactor = 0.8,
) {
    // calculate the number of shapes needed along the width and height
    const shapesAcrossWidth = Math.ceil(screenWidth / shapeSize);
    const shapesAcrossHeight = Math.ceil(screenHeight / shapeSize);

    // total number of shapes needed to roughly fill the canvas
    const totalShapes = shapesAcrossWidth * shapesAcrossHeight;

    return Math.ceil(totalShapes * fillFactor);
}

function map(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

async function addShapes() {
    if (isGenerating) return;
    isGenerating = true;

    const imageData = originalCtx.getImageData(
        0,
        0,
        originalCanvas.width,
        originalCanvas.height,
    );
    const shapeSize = currentShapeSize;
    const screenWidth = shapeCanvas.width;
    const screenHeight = shapeCanvas.height;
    const fillFactor = 0.95;

    const attempts = calculateAttempts(
        shapeSize,
        screenWidth,
        screenHeight,
        fillFactor,
    );

    console.log("drawing this many shapes:", attempts);

    for (let i = 0; i < attempts && isGenerating; i++) {
        const x = Math.floor(
            Math.random() * (originalCanvas.width - currentShapeSize),
        );
        const y = Math.floor(
            Math.random() * (originalCanvas.height - currentShapeSize),
        );

        const originalColor = getAverageColor(
            imageData,
            x,
            y,
            currentShapeSize,
        );
        const currentColor = getAverageColor(
            shapeCtx.getImageData(x, y, currentShapeSize, currentShapeSize),
            0,
            0,
            currentShapeSize,
        );

        if (getColorDifference(originalColor, currentColor) > 30) {
            drawShape(x, y, originalColor);

            // delay between shapes
            const delay = 0; //Math.max(1, 101 - speedControl.value);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    isGenerating = false;
}

// generateBtn.addEventListener("click", async function () {
//     isGenerating = false;
//     await new Promise((resolve) => setTimeout(resolve, 100)); // allow previous generation to stop

//     currentShapeSize ??= 50; // default to 50
//     shapeCtx.fillStyle = "#fff";
//     shapeCtx.fillRect(0, 0, shapeCanvas.width, shapeCanvas.height);
//     addShapes();
// });

let lastMouseX = 0;
let lastMouseY = 0;
let mouseShapeTimer = null;
let minShapeSize = 5;

function getAreaShapeSize(x, y, radius) {
    const imageData = shapeCtx.getImageData(
        Math.max(0, x - radius),
        Math.max(0, y - radius),
        Math.min(radius * 2, shapeCanvas.width - (x - radius)),
        Math.min(radius * 2, shapeCanvas.height - (y - radius)),
    );

    // calculate the number of unset pixels
    let emptyPixels = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (
            imageData.data[i] == backgroundColor.r &&
            imageData.data[i + 1] == backgroundColor.g &&
            imageData.data[i + 2] == backgroundColor.b
        ) {
            emptyPixels++;
        }
    }

    const totalPixels = imageData.data.length / 4;
    const emptyRatio = emptyPixels / totalPixels;

    // base the size calculation on screen dimensions or a fixed baseline
    const baseSize = Math.min(shapeCanvas.width, shapeCanvas.height) * 0.1; // 10% of the smaller dimension
    const maxSize = Math.min(shapeCanvas.width, shapeCanvas.height) * 0.6; // 60% for very empty areas
    const minSize = Math.max(1, baseSize * 0.5); // Minimum size

    // calculate size based on empty ratio
    if (emptyRatio > 0.5) {
        return Math.min(maxSize, baseSize * (1 + emptyRatio)); // increase size for emptier areas
    }

    return Math.max(minSize, baseSize * (1 - (1 - emptyRatio) * 0.5)); // decrease size for fuller areas
}
// Update the mousemove handler
shapeCanvas.addEventListener("mousemove", async function (e) {
    if (isGenerating) return;

    // Get mouse position relative to canvas
    const rect = shapeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only process if mouse has moved enough
    const distance = Math.hypot(x - lastMouseX, y - lastMouseY);
    if (distance < 5) return;

    lastMouseX = x;
    lastMouseY = y;

    // Clear any existing timer
    if (mouseShapeTimer) clearTimeout(mouseShapeTimer);

    //console.log("yoo we will be drawing");
    // Set new timer to add shapes
    mouseShapeTimer = setTimeout(async () => {
        const imageData = originalCtx.getImageData(
            0,
            0,
            originalCanvas.width,
            originalCanvas.height,
        );

        // Add multiple shapes around the mouse position
        for (let i = 0; i < 3; i++) {
            const offsetX = Math.round(x + (Math.random() - 0.5) * 30);
            const offsetY = Math.round(y + (Math.random() - 0.5) * 30);

            if (
                offsetX < 0 ||
                offsetX >= shapeCanvas.width ||
                offsetY < 0 ||
                offsetY >= shapeCanvas.height
            ) {
                continue;
            }

            //console.log("we have gotten past the first if");

            // Get the appropriate shape size for this area
            const areaShapeSize = getAreaShapeSize(offsetX, offsetY, 30);
            const originalSize = currentShapeSize;
            currentShapeSize = areaShapeSize;

            const originalColor = getAverageColor(
                imageData,
                offsetX,
                offsetY,
                currentShapeSize,
            );

            const currentColor = getAverageColor(
                shapeCtx.getImageData(
                    offsetX,
                    offsetY,
                    currentShapeSize,
                    currentShapeSize,
                ),
                0,
                0,
                currentShapeSize,
            );

            //console.log("original color=", originalColor);
            //console.log("current color=", currentColor);

            //console.log("WE WILL DRAW SOON");

            const colorDifference = getColorDifference(
                originalColor,
                currentColor,
            );

            //console.log("color dif=", colorDifference);
            if (colorDifference > 10) {
                //console.log("WE ARE DRAWING NOW");
                drawShape(
                    offsetX - currentShapeSize / 2,
                    offsetY - currentShapeSize / 2,
                    originalColor,
                );
                await new Promise((resolve) => setTimeout(resolve, 10));
            }

            currentShapeSize = originalSize;
        }
    }, 1);
});

// shapeCanvas.addEventListener("mousedown", function (e) {
//     const clickTimer = setInterval(() => {
//         const event = new MouseEvent("mousemove", {
//             clientX: e.clientX,
//             clientY: e.clientY,
//         });
//         shapeCanvas.dispatchEvent(event);
//     }, 10);

//     // Add mouseup listener to stop
//     const stopDrawing = () => {
//         clearInterval(clickTimer);
//         document.removeEventListener("mouseup", stopDrawing);
//     };

//     document.addEventListener("mouseup", stopDrawing);
// });

// addDetailBtn.addEventListener("click", async function () {
//     if (!isGenerating) {
//         currentShapeSize = Math.max(5, currentShapeSize * 0.7);
//         addShapes();
//     }
// });

document.getElementById("begin").addEventListener("click", function () {
    document.getElementsByClassName("intro-container")[0].remove();

    const audio = document.getElementById("backgroundMusic");

    audio.volume = 0.05;

    audio.play();

    if (!imageLoaded) {
        loadRandomImage();
    }
});
