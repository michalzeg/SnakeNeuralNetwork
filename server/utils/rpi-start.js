

const baseUrl = 'http://192.168.0.200:3000/start';

[
    {episodes: 20000, boardSize: 20, hidderLayers: 3, hiddenLayerUnits: 50 },
    {episodes: 20000, boardSize: 20, hidderLayers: 3, hiddenLayerUnits: 100 },
    {episodes: 20000, boardSize: 20, hidderLayers: 3, hiddenLayerUnits: 150 },
    {episodes: 20000, boardSize: 20, hidderLayers: 5, hiddenLayerUnits: 50 },
    {episodes: 20000, boardSize: 20, hidderLayers: 5, hiddenLayerUnits: 100 },
    {episodes: 20000, boardSize: 20, hidderLayers: 5, hiddenLayerUnits: 150 },
    {episodes: 20000, boardSize: 20, hidderLayers: 10, hiddenLayerUnits: 50 },
    {episodes: 20000, boardSize: 20, hidderLayers: 10, hiddenLayerUnits: 100 },
    {episodes: 20000, boardSize: 20, hidderLayers: 10, hiddenLayerUnits: 150 },
].forEach(async(v,i) =>{

    const queryString = Object.keys(v)
        .map(key => `${key}=${encodeURIComponent(v[key])}`)
        .join('&');
    const url = `${baseUrl}?${queryString}`;

    await fetch(url);
    console.log(`Finished ${i}`);
});