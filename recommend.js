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
// check for the .env file, if it doesn't exist, ask the user to include one
fs.access('./.env', function(err, res, body) {
  if (err && err.code === 'ENOENT') {
    console.log("No .env file found.  Please include one to run this program correctly.");
    return;
  }

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
  * getRepoContributorsStarredRepos: takes the username, repository and
  * callback function as arguments. Gets the http request
  * for the user-provided arguments and parses returned
  * body to JSON 
  *******************************************************/
  function getRepoContributorsStarredRepos(repoOwner, repoName, cb) {
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

  // run the program
  getRepoContributorsStarredRepos(owner, repo, function(err, result) {
    if (err) {
      console.log("Errors:", err);
      return;
    }

    let starredRepos = [];

    result.forEach((contributor, index) => {
      
      let options = {
        url: `https://api.github.com/users/${contributor.login}/starred`,
        headers: {
          'User-Agent': 'request',
          'Authorization' : env.GITHUB_TOKEN
        }
      }
      
      let mostStars = 0;
      let mostStarredRepo = "";
      request.get(options, function(err, res, body) {
        JSON.parse(body).forEach(starredRepo => {
          let repoFullName = starredRepo.full_name;
          let starGazerCount = starredRepo.stargazers_count;
          if (starGazerCount > mostStars) {
            mostStars = starGazerCount;
            mostStarredRepo = repoFullName;
          }
        });
        mostStarredRepoObj = {
          constributor: contributor.login,
          mostStars,
          mostStarredRepo
        }

        starredRepos.push(mostStarredRepoObj);
        if(index === result.length - 1) {
          console.log("Successfully retrieved the list of starred repos!");
          starredRepos.sort((a,b) => {
            return b.mostStars - a.mostStars;
          })
          for(let i = 0; i < 5; i++) {
            console.log(`[ ${starredRepos[i].mostStars} stars ] ${starredRepos[i].mostStarredRepo}`);
          }
        }
      }) 
    });
  });

});
