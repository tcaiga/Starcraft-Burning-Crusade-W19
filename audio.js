var music = new Audio("./audio/level1_song.mp3");

music.volume = .1;
var myCurrentVolume = music.volume;
var myIsMute = false;
playSound = function() {
    music.play();
}

music.addEventListener("ended", function() {
    music.currentTime = 0;
    music.play();
});