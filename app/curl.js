const parse = require('@juln/curl-to-json');
//
// var out = parse(`curl --request POST \\
//   --url https://text-translator2.p.rapidapi.com/translate`);
//
//
// let curl = `
// curl --request POST \\
// \t--url https://text-translator2.p.rapidapi.com/translate \\
// \t--header 'X-RapidAPI-Host: text-translator2.p.rapidapi.com' \\
// \t--header 'X-RapidAPI-Key: 593eb4277bmshf1d81f9fe1fe168p13489cjsn378a453830f6' \\
// \t--header 'content-type: application/x-www-form-urlencoded' \\
// \t--data source_language=en \\
// \t--data target_language=id \\
// \t--data 'text=What is your name?'
// `.replaceAll("\t", "  ")

// console.log(curl)
// var out = parse(curl);
// console.log(out)

function curl2JsonRouteHandler(req, res) {
    let curl = req.body.curl
    res.json({ data: parse(curl) });
}

module.exports = { curl2JsonRouteHandler };