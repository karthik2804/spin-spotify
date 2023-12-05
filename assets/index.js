const { el, mount, setChildren, list } = redom

const model = {
    state: {
        token: getAuthTokenFromHash() || null,
        rootURL: window.location.protocol + '//' + window.location.host,
        topTracks: [],
        recTracks: [],
    }
}
const URL = window.location.protocol + '//' + window.location.host;

let topTracks = []

function getAuthTokenFromHash() {
    var hash = window.location.hash.substr(1);

    var result = hash.split('&').reduce(function (res, item) {
        var parts = item.split('=');
        res[parts[0]] = parts[1];
        return res;
    }, {});

    return result['access-token']
}

async function getTop5Songs(accessToken) {
    let res = await fetch(`${URL}/api/getTop5Songs`, {
        method: "POST",
        body: accessToken
    })
    let data = await res.json()

    return data.items
}

async function createPlaylist(accessToken, tracksURI) {
    let res = await fetch(`${URL}/api/createPlaylist`, {
        method: "POST",
        body: JSON.stringify({
            token: accessToken,
            tracksURI: tracksURI
        })
    })
    let data = await res.json()

    return data
}


async function getRecs(accessToken, tracks) {
    let res = await fetch(`${URL}/api/getRecs`, {
        method: "POST",
        body: JSON.stringify({
            token: accessToken,
            tracks: tracks
        })
    })
    let data = await res.json()

    return data.tracks
}

let token = getAuthTokenFromHash()
getTop5Songs(token)

class Login {
    constructor() {
        this.loginButton = el("a.p-4.bg-green-500.block.text-black.rounded-xl",
            { href: `${model.state.rootURL}/internal/login/start?redirect_uri=${model.state.rootURL}/internal/login/callback` },
            el("div.flex.justify-center.items-center", "Login with", el("img.w-20.ml-2", { src: "/Spotify_Logo_RGB_Black.png" })))
        this.el = el("div", this.loginButton)
    }
}

class Header {
    constructor() {
        this.el = el("div.w-full.flex.text-xl.text-green-500.font-bold.bg-gray-800.p-4", "Spin Spotify Unwrapped")
    }
}

class SongListitem {
    constructor() {
        this.title = el("div.text-green-500.text-lg")
        this.artist = el("artist.text-gray-600.text-sm")
        this.container = el("div.flex-grow", this.title, this.artist)
        this.preview = el("img.w-20.h-20.mr-4.rounded-xl",)
        this.el = el("div.m-2.flex.mb-2.bg-gray-800.p-4.rounded-xl", this.preview, this.container)
    }
    update(data) {
        this.title.textContent = data.name
        let artists = []
        data.artists.map(k => {
            artists.push(k.name)
        })
        this.artist.textContent = artists.join(", ")
        this.preview.src = data.album.images[0].url
    }
}

class TopSongs {
    constructor(callback) {
        this.callback = callback
        this.spinner = el("div.w-8.h-8.rounded-full.animate-spin.border-4.border-solid.border-green-500.border-t-transparent.mr-4")
        this.loadingstate = el("div.text-green-500.flex.justify-center.items-center", this.spinner, "Loading top songs!")
        this.el = el("div.flex.flex-col.justify-center")
        this.topSongsTitle = el("div.text-white", "Your top 5 songs")
        this.songList = list("div.flex.flex-col.w-96.mb-4", SongListitem)
        this.generateRecs = el("button.bg-green-500.p-4.text-black.rounded-lg", { onclick: function (e) { this.callback() }.bind(this) }, "Generate Recommendations")
        setChildren(this.el, [this.loadingstate])
        this.fetchTopSongs()
    }

    async fetchTopSongs() {
        model.state.topTracks = await getTop5Songs(model.state.token)
        this.songList.update(model.state.topTracks)
        setChildren(this.el, [this.topSongsTitle, this.songList, this.generateRecs])
        console.log("fetched Top 5 tracks")
    }
}

class GenerateRecommendations {
    constructor(callback) {
        this.callback = callback
        this.spinner = el("div.w-8.h-8.rounded-full.animate-spin.border-4.border-solid.border-green-500.border-t-transparent.mr-4")
        this.loadingstate = el("div.text-green-500.flex.justify-center.items-center", this.spinner, "Generating Recommendations!")
        this.topSongsTitle = el("div.text-white", "Recommended songs")
        this.songList = list("div.flex.flex-wrap.mb-4", SongListitem)
        this.generateRecs = el("button.bg-green-500.p-4.text-black.rounded-lg", { onclick: function (e) { this.callback() }.bind(this) }, "Create Playlist")
        this.el = el("div.flex.flex-col.justify-center.p-4.h-full.overflow-y-auto")
        setChildren(this.el, [this.loadingstate])
        this.getRecs()
    }

    async getRecs() {
        let tracks = []
        model.state.topTracks.map(k => {
            tracks.push(k.id)
        })
        model.state.recTracks = await getRecs(model.state.token, tracks.join(","))
        this.songList.update(model.state.recTracks)
        setChildren(this.el, [this.topSongsTitle, this.songList, this.generateRecs])
        console.log("generated recommended 15 tracks")
    }
}

class UnwrappedComponent {
    constructor() {
        this.topSongs = new TopSongs(this.generateRecs.bind(this))
        this.el = el("div.w-full.flex.flex-col.justify-center.items-center.overflow-hidden", this.topSongs)
    }
    generateRecs() {
        this.recommendations = new GenerateRecommendations(this.createPlaylist.bind(this))
        setChildren(this.el, [this.recommendations])
    }
    async createPlaylist() {
        console.log("Creating playlist")
        this.spinner = el("div.w-8.h-8.rounded-full.animate-spin.border-4.border-solid.border-green-500.border-t-transparent.mr-4")
        this.loadingstate = el("div.text-green-500.flex.justify-center.items-center", this.spinner, "Creating Playlist!")
        setChildren(this.el, [this.loadingstate])
        let tracks = []
        model.state.topTracks.map(k => {
            tracks.push(k.uri)
        })
        model.state.recTracks.map(k => {
            tracks.push(k.uri)
        })
        let res = await createPlaylist(model.state.token, tracks)
        this.temp = el("div.w-96.h-96")
        this.temp.innerHTML = `
        <iframe
  title="Spotify Embed: Recommendation Playlist "
  src="https://open.spotify.com/embed/playlist/${res.id}?utm_source=generator&theme=0"
        width = "100%"
        height = "100%"
        style = {{ minHeight: '360px' }
    }
    frameBorder = "0"
    allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    loading = "lazy"
        />
        `
        setChildren(this.el, [this.temp])
    }
}
class App {
    constructor() {
        this.header = new Header()
        this.loginButton = new Login()
        this.unwrappedComponent = new UnwrappedComponent()
        this.container = el("div.flex-grow.flex.justify-center.items-center")
        if (model.state.token) {
            setChildren(this.container, [this.unwrappedComponent])
        } else {
            setChildren(this.container, [this.loginButton])
        }
        this.el = el("div.w-full.h-full.bg-black.flex.flex-col", this.header, this.container)
    }
}

const app = new App()
mount(document.body, app)