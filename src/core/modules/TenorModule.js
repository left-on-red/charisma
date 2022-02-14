var https = require('https');
var base = 'https://api.tenor.com/v1';
let CoreModule = require('./../CoreModule.js');

async function get(url) {
    return new Promise(function(resolve, reject) {
        https.get(url, function(response) {
            var data = '';
            response.on('data', function(chunk) { data += chunk });
            response.on('end', function() { resolve(JSON.parse(data)) });
            response.on('error', function(error) { reject(error) })
        });
    });
}

class TenorModule extends CoreModule {
    /**
     * 
     * @param {*} context 
     */
    constructor(context) {
        super('tenor');
        this.context = context;
    }

    randomGif = async (terms) => {
        let retrieved = await get(`${base}/random?key=${this.context.config.main.tenor}&limit=1&q=${terms.split(' ').join('-')}`);
        return retrieved.results[0].media[0].gif.url;
    }
}

module.exports = TenorModule;