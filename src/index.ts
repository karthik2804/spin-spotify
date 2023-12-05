import { HandleRequest, HttpRequest, HttpResponse, Kv, Router } from "@fermyon/spin-sdk"

const decoder = new TextDecoder()
const router = Router()
router.post("/api/getTop5Songs", async (_, req) => { return await getTop5Songs(req.text()) })
router.post("/api/getRecs", async (_, req) => { return await getRecs(req.json()) })
router.post("/api/createPlaylist", async (_, req) => { return await createPlaylist(req.json()) })
router.all("*", () => {
  return {
    status: 404
  }
})

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {
  return await router.handleRequest(request, request)
}

async function getTop5Songs(token: string): Promise<HttpResponse> {
  let res = await fetchWebApi('v1/me/top/tracks?time_range=short_term&limit=5', 'GET', token)

  return {
    status: 200,
    body: res
  }
}

interface getRecsRequest {
  token: string,
  tracks: string,
}

async function getRecs(data: getRecsRequest): Promise<HttpResponse> {
  let res = await fetchWebApi(`v1/recommendations?limit=15&seed_tracks=${data.tracks}`, 'GET', data.token)

  return {
    status: 200,
    body: res
  }
}

interface createPlaylistRequest {
  tracksURI: string[],
  token: string,
}

async function createPlaylist(data: createPlaylistRequest): Promise<HttpResponse> {
  const { id: user_id } = JSON.parse(await fetchWebApi('v1/me', 'GET', data.token))
  const playlist = JSON.parse(await fetchWebApi(
    `v1/users/${user_id}/playlists`, 'POST', data.token, JSON.stringify({
      "name": "Spin recommendation playlist",
      "description": "Playlist created using Fermyon Spin",
      "public": false
    })))

  let res = await fetchWebApi(
    `v1/playlists/${playlist.id}/tracks?uris=${data.tracksURI.join(',')}`,
    'POST', data.token
  );


  return {
    status: 200,
    body: JSON.stringify(playlist)
  }
}


async function fetchWebApi(endpoint: string, method: string, token: string, body?: string,): Promise<any> {
  let request = {
    headers: {
      Authorization: `Bearer ${token}`,
      "user-agent": "curl/7.54.1 ",
      "content-length": `${new TextEncoder().encode(body || "").length}`
    },
    method
  }
  if (body) {
    //@ts-ignore
    request.body = body
  }
  const res = await fetch(`https://api.spotify.com/${endpoint}`, request);
  return await res.text()
  // return await res.json();
}

