// require request package and secrets
var request = require('request');
var secrets = require('./secrets');
// store owner and repo arguments
var owner = process.argv[2];
var repo = process.argv[3];

// if the user forgets to enter in two arguments, let them know
if (!owner || !repo) {
  console.log("This application require two arguments.  Please enter a username and repository");
  return;
}

// intro message to let them know the program is running
console.log('Welcome to the GitHub Avatar Downloader!');
console.log("Downloading Avatars...");

/******************************************************* 
* getRepoContributors: takes the username, repository and
* callback function as arguments. Gets the http request
* for the user-provided arguments and parses returned
* body to JSON 
*******************************************************/
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
    /******************************************************* 
    * callback: takes the error, and JSON body as arguments.
    * Loops through each collaborator's info and download's 
    * their image
    *******************************************************/
    cb(err, body);
  });
}

/******************************************************* 
* downloadImageByURL: takes the username, repository and
* callback function as arguments. Loops through each 
* collaborator's info and download's their image
*******************************************************/
function downloadImageByURL(url, filePath) {
  var fs = require('fs');
  request.get(url)
  .on('error', function (err) {
    throw err; 
  })
  .pipe(fs.createWriteStream(filePath))
}

// run the program
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
  console.log("Successfully downloaded the avatars!");
});
