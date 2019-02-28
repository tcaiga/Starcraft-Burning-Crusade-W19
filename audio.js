var music = new Audio("./audio/young_blood.mp3");

music.volume = .1;

var myCurrentVolume = music.volume;
var myIsMute = false;
playSound = function() {
    music.play();
}