# Spotify Server

Let the whole team choose what Spotify is playing in the office speakers.
Also works if you want people at say a party easily check what song is currently being played, if they're too shy to ask someone.

## Installation

You must have node.js and npm installed.

* Clone this repo  
    `$ git clone spotify-server@git`
* Enter the created directory  
    `$ cd spotify-server`
* Install dependencies  
    `$ npm install`
* Start the server  
    `$ node web.js`

Then try it out by visiting [http://localhost:3000](http://localhost:3000)

## How to use Spotify Server

**[/play](http://localhost:3000/play)**  
Plays current song if no song is playing, pauses if a song is currenty playing.

**[/next](http://localhost:3000/next)**  
Plays next song in the play queue.

**[/prev](http://localhost:3000/prev)**  
Plays previous song in the play queue.

**[/get/property](http://localhost:3000/get/name)**  
Get a player or track property. Currently supported properties: [/state][get1], [/position][get2], [/volume][get3], [/name][get4], [/artist][get5], [/album][get6], [/duration][get7], [/url][get8].

**[/set/property/value](http://localhost:3000/set/volume/50)**  
Set a player property. Currently supported:

* [/state][set1] - _play_ or _pause_.
* [/position][set2] - Number of seconds. Must be at least 0 and less than the lenght of the track.
* [/volume][set3] - Number of seconds. Must be between 0 and 100.

## Contribution

Contributions are very much appreciated. The following are stuff that need special attention:

* **A UI**  
Currently this is not much more than a REST API, which is not very usable.
* **Windows support**  
Is there a way to interact with Spotify from the commad prompt in windows?
* **Linux support**  
Actually I have no idea if this works in Linux. Anyone have an idea?
* **Get rid of Express.js**  
Express is kinda bloated when I'm only using the routing part, though it was fast to get running. But it should't require much work to refactor it out of here and make this module dependency free.
* **Web Sockets API**  
Wouldn't it be awesome if you could be pushed automagically when a new song is played?

If you want to contribute just clone this repo, make your own branch, follow current coding style, change/add one feature per commit, and issue a pull request when you're done. Cuntributors will be credited below.

Thanks to nicoo for this comhempresible [list of supported Spoitfy commands](http://www.instructables.com/id/RFID-Controls-for-Spotify-on-OSX-using-hacked-Mir/step3/Spotify-osascript-commands/).

[get1]: http://localhost:3000/get/state
[get2]: http://localhost:3000/get/position
[get3]: http://localhost:3000/get/volume
[get4]: http://localhost:3000/get/name
[get5]: http://localhost:3000/get/artist
[get6]: http://localhost:3000/get/album
[get7]: http://localhost:3000/get/duration
[get8]: http://localhost:3000/get/url

[set1]: http://localhost:3000/set/state/pause
[set2]: http://localhost:3000/set/position/200
[set3]: http://localhost:3000/set/volume/50