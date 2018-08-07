var request = require('request');
var secrets = require('./secrets');
var owner = process.argv[2];
var repo = process.argv[3];

console.log('Welcome to the GitHub Avatar Downloader!');

var requestOptions = {
  host: 'sytantris.github.io',
  path: '/http-examples/step5.html'
};

function getRepoContributors(repoOwner, repoName, cb) {
  var options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers: {
      'User-Agent': 'request',
      'Authorization' : secrets.GITHUB_TOKEN
    }
  };

  request(options, function(err, res, body) {
    var body = JSON.parse(body);
    cb(err, body);
  });
}

getRepoContributors(owner, repo, function(err, result) {
  if (err) {
    console.log("Errors:", err);
    return;
  }

  for (element in result) {
    var filePath = "avatars/" + result[element].login + ".jpg";
    var url = result[element].avatar_url;
    downloadImageByURL(url, filePath);
  }
});

function downloadImageByURL(url, filePath) {
  var fs = require('fs');
  request.get(url)
  .on('error', function (err) {
    throw err; 
  })
  .pipe(fs.createWriteStream(filePath))
}
