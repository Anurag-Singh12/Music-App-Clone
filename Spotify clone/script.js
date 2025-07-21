let currentSong = new Audio(); //global variable
let songs;


function secondsToMinutesSeconds(seconds) { //secondsToMinutesSeconds for music duration
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs() {//currenttarget used for click whole card main thing yaad rakhna comment mei add krke
  let a = await fetch("http://127.0.0.1:5500/Spotify Clone/songs"); //fetching songs from the folder
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div"); //saving a(anchor) tags in this div
  div.innerHTML = response;
  let as = div.getElementsByTagName("a"); //trying to get a(anchor) tags

  //now use loops to get href attribute in a tags

  let songs = []; //array for saving songs
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      // if it's ends with mp3 file it will push
      songs.push(element.href.split("/songs/")[1]);
    }
  }
  // console.log(songs); // to check in do we get songs from above code
  //for now return it (ideally use server i.e API)
  return songs;
}

const playMusic = (track) => {
  currentSong.src = "/songs/" + track;
  currentSong.play();
  play.src = "pause.svg"
  document.querySelector(".songinfo").innerHTML = track
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

};

async function main() {
  //get the list of all the song
  songs = await getsongs();
  console.log(songs);

  //show all the songs in the playlist

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0]; //[0] means ul ka first item jo hai
  for (const song of songs) {
    //using for of loop b/c it will store as array
    songUL.innerHTML =
      songUL.innerHTML +
      `<li> <img class="invert" src="/img/music.svg" alt="">
                        <div class="info">
                          <div> ${song.replaceAll("%20", " ")}</div>
                          <div>Sng Artist</div>
                        </div>

                        <div class="playnow">
                          <span>Play Now</span> 
                        <img class="invert" src="img/play.svg" alt="">
                        </div> </li>`; //`<li> ${song.replaceAll("%20", " ")}</li>` use this to add them in a list and replace %20 and garbage data
  }

  // Attach an event listener to each song and stored in array and using for each loop

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  //attach an event listener to play , next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";//logic for seekbar

    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
      document.querySelector(".left").style.left = "0" //-100 to 0 (from css)
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src/*means change source*/.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

     // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100") //here seting vol../100 is just string to see in js
        currentSong.volume = parseInt(e.target.value) / 100 //volume is a predefined function
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })


  //play the first song
  // var audio = await new audio(songs[0]);
  //audio.play();
}

main()
