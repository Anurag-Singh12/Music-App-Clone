let currentSong = new Audio(); //global variable Which Helps to Play one at a time
let songs;
let currFolder;

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
async function getsongs(folder) {//currenttarget used for click whole card main thing yaad rakhna comment mei add krke
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/Spotify clone/${folder}/`); //fetching songs from the folder
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
  songUL.innerHTML = ""
  for (const song of songs) {
    //using for of loop b/c it will store as array
    songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="">
                        <div class="info">
                          <div> ${song.replaceAll("%20", " ")}</div>
                          <div>Song Artist</div>
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

    return songs
}



//Function for Playing Songs While clicking on it
const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if(!pause){
    currentSong.play();
    play.src = "img/pause.svg"
  }
  // play.src = "pause.svg" //by default when the song is playing
  document.querySelector(".songinfo").innerHTML = decodeURI(track)   //show the track name
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00" //show the duration
};


async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`http://127.0.0.1:5500/Spotify clone/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 

            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
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
  await getsongs("songs/Punjabi");
  console.log(songs);
  playMusic(songs[0], true) //play first song and true pause which is false by default


  displayAlbums()
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


//  play the first song
  // var audio = await new audio(songs[0]);
  // audio.play();
}

main()
