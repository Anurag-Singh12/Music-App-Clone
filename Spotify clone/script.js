let currentSong = new Audio(); //global variable Which Helps to Play one at a time
let songs;
let currentFolder;

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

//FETCHING SONGS
async function getSongs(folder) {//currenttarget used for click whole card main thing yaad rakhna comment mei add krke
  currentFolder = folder;
  let a = await fetch(`${folder}/`) //fetching songs from the folder
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div"); //saving a(anchor) tags in this div
  div.innerHTML = response;
  let as = div.getElementsByTagName("a"); //trying to get a(anchor) tags

  //now use loops to get href attribute in a tags

  songs = []; //array for saving songs
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      // if it's ends with mp3 file it will push
      songs.push(element.href.split(`/${folder}/`)[1]); //split /songs/ it will provide array before and after /song/ 
    }
  }
  // console.log(songs); // to check in do we get songs from above code
  //for now return it (ideally use server i.e API)
  // return songs;



  //show all the songs in the playlist

  let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]; //[0] means ul ka first item jo hai
  songUL.innerHTML = "";
  for (const song of songs) {
    //using for of loop b/c it will store as array
    songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="">
                        <div class="info">
                          <div> ${song.replaceAll("%20", " ")}</div>
                          <div>Anurag ji</div>
                        </div>

                        <div class="playnow">
                          <span>Play Now</span> 
                        <img class="" src="img/play.svg" alt="">
                        </div> </li>`; //`<li> ${song.replaceAll("%20", " ")}</li>` use this to add them in a list and replace %20 and with "" a space
  }

  // Attach an event listener to each song and stored in array by using for each loop

  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    return songs;
}



//Function for Playing Songs While clicking on it
const playMusic = (track, pause = false) => {
  currentSong.src = `${currentFolder}/` + track;
  if(!pause){
    currentSong.play();
    play.src = "img/pause.svg"
  }
  // play.src = "pause.svg" //by default when the song is playing
  document.querySelector(".songinfo").innerHTML = decodeURI(track)   //show the track name removig % etc
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00" //show the duration
};


async function displayAlbums() {
    console.log("displaying albums")
    let cardContainer = document.querySelector(".cardContainer");
    // cardContainer.innerHTML = "";
    let a = await fetch(`Songs/`) //`/songs/`
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    
    
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("songs/")){ // && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-1)[0]
            // Get the metadata of the folder
            let a = await fetch(`songs/${folder}/info.json`)
            let response = await a.json(); 

           cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play"><img class="invert" src="img/play.svg" alt="Play Button"></div>
            <img src="Songs/${folder}/cover.jpg" >
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`;
    
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })
}


//MAIN FUNCTION
async function main() {
  //Get the list of all the song
  await getSongs("songs/Arijit");
  console.log(songs);
  playMusic(songs[0], true) //play first song and true pause which is false by default


   displayAlbums();

  //Attaching an event listener to play , next and previous
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
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}` // 00: 00 format
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";//logic for seekbar

    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100; //offsetX is the direction and getBoundingClientRect() given by js default shows the where we are on the page
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
      document.querySelector(".left").style.left = "0" //-130 to 0 (from css to make it visible)
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%" //0 to -120 (from css to hide)
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]) /*means change source*/
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

    //Volume svg's
     document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })


//  play the first song
  // var audio = await new audio(songs[0]);
  // audio.play();
}

main();
