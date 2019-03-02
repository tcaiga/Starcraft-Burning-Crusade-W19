var music = new Audio("./audio/young_blood.mp3");

music.volume = .1;
playSound = function() {
    music.play();
}

music.addEventListener("ended", function() {
    music.currentTime = 0;
    music.play();
});