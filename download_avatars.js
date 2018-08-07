// require request package, secrets, fs and env
var request = require('request');
var secrets = require('./secrets');
var fs = require('fs');
require('dotenv').config();
var env = process.env;
// check if the access token is missing
if(!env.GITHUB_TOKEN){
  console.log("The .env file is missing an access token.  Please add it to run this program correctly.");
  return;
}
// check for the avatars directory, if it doesn't exist, create it
fs.access('avatars', function(err) {
  if (err && err.code === 'ENOENT') {
    fs.mkdir('avatars', function(err) {
      if (err) {
        console.log("Errors:", err);
        return;
      }
    });
  }
});
// check for the .env file, if it doesn't exist, ask the user to include one
fs.access('./.env', function(err, res, body) {
  if (err && err.code === 'ENOENT') {
    console.log("No .env file found.  Please include one to run this program correctly.");
    return;
  }

  // store owner and repo arguments
  var owner = process.argv[2];
  var repo = process.argv[3];

  // if the user doesn't enter exactly two arguments, let them know
  if (process.argv.length != 4) {
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
        'Authorization' : env.GITHUB_TOKEN
      }
    };

    request(options, function(err, res, body) {
      var body = JSON.parse(body);
      // if the repo or owner doesn't exist, let them know
      if (body.message === "Not Found") {
        console.log("Download failed: this repo doesn't exist.");
        return;
      }
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
    request.get(url)
    .on('error', function (err) {
      throw err; 
    })
    .pipe(fs.createWriteStream(filePath));
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

});
