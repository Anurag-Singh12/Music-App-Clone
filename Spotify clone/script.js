// console.log("Checking if the script is loaded in the browser");
let currentSong = new Audio();               //Creates a new Audio object, built-in browser obj for playing audio files
let songs;                                   //store an array of song
let currentFolder;                           //track current folder

//Function 1: secondsToMinutesSeconds
function secToMinSec(seconds) {  
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');  //Converts minutes to string and pads it with zeros on the left to ensure 2 digits
    const formattedSeconds = String(remainingSeconds).padStart(2, '0'); //same as above

    return `${formattedMinutes}:${formattedSeconds}`;  //return e.g. "03:08"
}

//Function 2: getSongs-from the folder
async function getSongs(folder)              
{
    currentFolder = folder;
    let a = await fetch(`${folder}/`)                            // URL e.g. "Punjabi/"
    let response = await a.text();                               //body as text - typically HTML

    let div = document.createElement("div");
    div.innerHTML = response;                //creates div and parse (raw html response) for access songs in <a>tags etc

    let as = div.getElementsByTagName("a");
    songs = [];                              //Initializes the global songs array to store song filenames

    for (let index = 0; index < as.length; index++) {
        const element = as[index];            //fetch the anchor at the current index
        if(element.href.endsWith(".mp3"))
        {
            songs.push(element.href.split(`/${folder}/`)[1]); //push in songs array
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {                       //for of loops through each element in songs array
        songUL.innerHTML = songUL.innerHTML + `<li>
        
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div> 
        </div>

        <div class="playnow">
          <span>Play Now</span>
          
        <img class= "invert" src="img/music.svg" alt="">
        </div>

      </li>`;
    } //<img src="img/play.svg" alt="">

    //Converts the (<li> elements) inside (.songList) into an array to use forEach
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=> //means Iterates through each <li> element
    {
        e.addEventListener("click",element => {                                           //click event on each <li> item
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        });
    })
    return songs;
}

//Function 3: PlayMusic
//Sets the audio source for the global currentSong Audio object as currentFolder/track
const playMusic = (track, pause = false) => {                          //pause is default parameter
    currentSong.src =`${currentFolder}/` + track;                      // Set audio source
    if(!pause)                                                         // If pause is false:plays the song.
    {
        currentSong.play();
        play.src = "img/pause.svg"; 
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);  //show the track name removig % etc
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";   // Reset displayed time
}

//Function 4: To Display albums cards dynamically
async function displayAlbums()
{
    let a = await fetch(`songs/`)
    let response = await a.text();
    let cardContainer = document.querySelector(".cardContainer");
    let div = document.createElement("div"); //Parses it in div fill with innerhtml
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");  //selects all <a>
    let array = Array.from(anchors); // converts html collection into a array

        for (let index = 0; index < array.length; index++) {
            const e = array[index];     //e holds the current anchor element for each iteration.
        if (e.href.includes("/songs/")){//|| !e.href.includes(".htaccess")

            let folder = e.href.split("/").slice(-1)[0];
            let a = await fetch(`songs/${folder}/info.json`)
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play"><img class="invert" src="img/play.svg" alt="Play Button"></div>
            <img src="songs/${folder}/cover.jpg" alt="${folder}">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`;

        }
    };

    //Converts in array all cards items and (for each)loops through each card
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item =>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);  //Plays the first song
        })
    });
}


////Function 5: Main function
async function main()
{

    await getSongs("songs/Arijit");  //initially Loads songs from folder "songs/Arijit"
    playMusic(songs[0], true);       //Plays the first song (songs) but paused because of true flag
    displayAlbums();
    

    //event listener for play & pause
    play.addEventListener("click", () => {
        if(currentSong.paused)               //These are native JavaScript Audio object methods(paused/play/pause).
        {                                    //currentSong is an instance of the Audio class-let currentSong = new Audio();
            currentSong.play();
            play.src = "img/pause.svg";       //play/pause defined in html
        }
        else
        {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    })

    //For Previous Song
    //Plays previous song or loops to last song if at start
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);  //finds current song index
        if(index == 0)                                  //checks if index=0 currently at the first song in the playlist
        {
            playMusic(songs[(songs.length) - 1]);      // then play last song
        }
        else
        {
            playMusic(songs[index - 1]);             //Play prev song-For all other cases (not the first song)
        }
    });   

    //For Next Song
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if(index == songs.length - 1)              //checks if the song playing is the last song in playlist
        {
            playMusic(songs[0]);                 //Play first song
        }
        else
        {
            playMusic(songs[index  + 1]);        //Play the next song-for all other cases 
        }
    }); 

    //for timeupdate event(duration:secondsToMinutesSeconds)
    //display as MM:SS (currentTime)
     currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secToMinSec(currentSong.currentTime)} / ${secToMinSec(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"; 
    })

    // For seekbar moving with connected duration
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
    

    //For Volume range with sound value
   document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        //console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })
    
    //Volume img-switch between mute and normal with sound value
    document.querySelector(".volume img").addEventListener("click", e =>{
         if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else
        {
           e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });

    //Hamburger icon
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //Hamburger close icon
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
   
}

main();
