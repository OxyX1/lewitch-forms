const texts = ["lightweight and secure!", "sweet sweet gui :)", "easy to get around!", "share music!", "create servers!"];
let index = 0;

const textElement = document.getElementById("text");

function changeText() {
    textElement.classList.remove("fade-in");
    setTimeout(() => {
        textElement.textContent = texts[index];
        textElement.classList.add("fade-in");
        index = (index + 1) % texts.length;
    }, 200);
}

setInterval(changeText, 1000);
