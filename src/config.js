
module.exports = {
  token: process.env.DISCORD_TOKEN || '', // your discord bot token
  clientId: process.env.CLIENT_ID || "1113028657762549770",
  prefix: process.env.PREFIX || ',', // bot prefix
  ownerID: (process.env.OWNER_IDS || '').split(','), //your discord id
  SpotifyID: process.env.SPOTIFY_ID || 'e6f84fbec2b44a77bf35a20c5ffa54b8', // spotify client id
  SpotifySecret: process.env.SPOTIFY_SECRET || '498f461b962443cfaf9539c610e2ea81', // spotify client secret
  ankushcolor: '#21232B', // embed colour
  bugReportChannel: "", // ID of the channel where bug reports will be sent
  embedColor: '#0x21232B', // Using your existing ankushcolor
  supportServer: "https://discord.com/invite/w77ymEU82a", // Your support server link
  
  nodes: [
    {
      url: `lavalinkv4.serenetia.com:80`,
      name: `NOTHING`,
      auth: `https://dsc.gg/ajidevserver`,
      secure: false
    }
  ],
};

