// Wait for the entire page to load before executing our code
document.addEventListener("DOMContentLoaded", async function () {
    // Retrives element for collapsible file strcuture from HTML code
    var fileList = document.getElementById("file-list");
    // Retrives element for search results from HTML code
    var searchResults = document.getElementById("search-results");

    // Define the GitHub repository owner and repository name
    var repoOwner = "provesecai";
    var repoName = "TTP-Procedures";
    // Set up the GitHub API so that the files automatically update when added or removed#
    // Now using cloudflare worker, added workers link below
    var apiUrl = "https://github-proxy.perticamatteo8.workers.dev";

    
    // Initates headers for the start of the API token for authentication
    var headers = {};

    // Fetching the files tree strcuture from GitHub using XMLHttp (could switch to fetch if needed)
    var xhr = new XMLHttpRequest(); // Creates a new object, to make HTTP requests
    xhr.open("GET", apiUrl, true); // GET request for apiURL 
    // Sets headers if defined
    for (var h in headers) {
      if (headers.hasOwnProperty(h)) {
        xhr.setRequestHeader(h, headers[h]);
      }
    // Function that will run when request changes
    }    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) { // Checks if the request is finished "4" and the HTTP is good "200"
        var data = JSON.parse(xhr.responseText); // Converts GitHubs JSON so javascript can read
        if (!data.tree) {
          console.log("Invalid API response,"); // Checks if tree is present, if not gives log
          return;
        }
        var fileTree = buildFileTree(data.tree); // Calls "buildFileTree()" to make collapsible file structure
        fileList.appendChild(renderTree(fileTree, "")); // To continue completion the renderTree is called and is displayed using "file-list"
      }
    };
    xhr.send(); // Sends request
  });
  
  // Keeps all .txt files hidden for when they are searched for
  var flattenedFiles = {};
  
  // Build a nested tree structure from the file list
  function buildFileTree(files) {
    var tree = {};
    for (var i = 0; i < files.length; i++) { // Loops through each file
      var file = files[i];
      if (file.type === "blob" && file.path.indexOf(".txt") > -1) { //Reconsises files that are "blobs" and that end in .txt to indicate its a file
        var parts = file.path.split("/"); // Splits file and folder names
        // Skip the first directory level (We want it to start on the stage names)
        if (parts.length > 1) {
          parts = parts.slice(1);
        }
        var current = tree;
        for (var j = 0; j < parts.length; j++) { //loops through each path to locate all areas
          var part = parts[j];
          if (!current[part]) {
            if (j === parts.length - 1) {
              current[part] = file;
            } else {
              current[part] = {};
            }
          }
          current = current[part]; //moves a level deeper
        }
        flattenedFiles[file.path] = file; //stores files in "flattended files for searching"
      }
    }
    return tree;
  }
  
  // Render the collapsible tree structure
  function renderTree(tree, parentPath) {
    parentPath = parentPath || ""; //Gives empty string if no parent path is there
    var ul = document.createElement("ul"); //Created an unordered list to represent files level
  
    for (var key in tree) {
      if (tree.hasOwnProperty(key)) { //loops through current folder
        var li = document.createElement("li"); // Creates an item in a list for each folder
  
        // Checks if its a folder, it will not have a path if it is
        if (typeof tree[key] === "object" && !tree[key].path) {
          var btn = document.createElement("button"); //Creates button for folder
          btn.className = "collapsible"; //Allows it to collapse 
          btn.innerHTML = " ⇒  " + key; //Includes arrow next to folder when closed, ALL ARROWS FROM UNICODE MAYBE CHANGE LATER?
  
          var content = renderTree(tree[key], parentPath + "/" + key); //Looks for the contents of the folder above
          content.className = "content"; 
          content.style.display = "none"; // Makes sure content is initally hidden (so it can be opened)
  
          // This code allows folders to be opened/closed
          btn.onclick = (function(btn, key, content) {
            return function() {
              if (content.style.display === "none") {
                // Expands folder if closed
                content.style.display = "block";
                btn.innerHTML = " ⇓  " + key; // Displays arrow to show its open
              } else {
                content.style.display = "none"; // Once its open this code allows it to close
                btn.innerHTML = " ⇒  " + key; // Arrow changes back to show its closed
              }
            };
          })(btn, key, content);

          // Applies folder button and contents to the list
          li.appendChild(btn);
          li.appendChild(content);
        } else {
          // This is a file.
          // The code that makes the file open in a new tab when clicked on
          var a = document.createElement("a");
          a.href = "https://raw.githubusercontent.com/" + "provesecai" + "/" + "TTP-Procedures" + "/main/" + tree[key].path;
          a.target = "_blank"; // New tab
          a.innerHTML = key;
          li.appendChild(a);
  
          // Create a download button next to the file link
          var dwnBtn = document.createElement("a");
          dwnBtn.href = "#"; // make sure it dosen't navigate, causes issues with download
          dwnBtn.style.marginLeft = "5px";
          dwnBtn.innerHTML = "↓"; // Arrow to show it can be downloaded
          // Save the file name in a data attribute
          dwnBtn.setAttribute("data-file", tree[key].path.split("/").pop());
          dwnBtn.onclick = (function(a, dwnBtn) { //Onlick event listener to the arrow button
            return function(e) {
              e.preventDefault();
              // Gets the file as a Blob and triggers download
              fetch(a.href)
                .then(function(response) {
                  return response.blob();
                })
                .then(function(blob) {
                  var url = window.URL.createObjectURL(blob); //Creates temporary URL so it can be downloaded
                  var tempLink = document.createElement("a"); // Link is made so the download can trigger, wont work without!!!
                  tempLink.style.display = "none";
                  tempLink.href = url; // Uses url for download
                  tempLink.download = dwnBtn.getAttribute("data-file"); // Makes it so it downloads the right file that was stored in data before
                  document.body.appendChild(tempLink);
                  tempLink.click(); //Click causes download 
                  document.body.removeChild(tempLink);
                  window.URL.revokeObjectURL(url);
                })
                .catch(function(err) {
                  console.error("Download error:", err); //Error logger for debugging
                });
            };
          })(a, dwnBtn);
          li.appendChild(dwnBtn); // Adds download button to the listed objects 
        }
        ul.appendChild(li);
      }
    }
    return ul; //Displays unordered list representing the branch
  }
  
  // Handle file search functionality
  function searchFiles() {
    var input = document.getElementById("search-box"); // Grabs id from HTML
    var filter = input.value.toUpperCase(); // Prevents issues with case sensitivity 
    var fileList = document.getElementById("file-list"); // grabs all files
    var searchResults = document.getElementById("search-results"); //Grabs id for seach results in HTML

    // If search is empty, show the collapsible tree and hide search results
    if (filter === "") {
        fileList.classList.remove("hidden");
        searchResults.classList.add("hidden");
        searchResults.innerHTML = ""; // Clear search results
        return;
    }

    // Otherwise, hide the collapsible tree and show search results
    fileList.classList.add("hidden");
    searchResults.classList.remove("hidden");
    searchResults.innerHTML = ""; // Clear previous search results

    var keys = Object.keys(flattenedFiles); // Gets all file paths from flattened objects
    for (var i = 0; i < keys.length; i++) { //Creates the loop that searches through each file path in the flattened files
        var filePath = keys[i];
        var fileName = filePath.split("/").pop();
        if (fileName.toUpperCase().indexOf(filter) > -1) { //Checks if there are any matches that contain typed search
            var li = document.createElement("li"); //Creates list for matching files

            // Allows for files to be opended in new tab (same as in collapsible file tree)
            var a = document.createElement("a");
            a.href = "https://raw.githubusercontent.com/provesecai/TTP-Procedures/main/" + filePath;
            a.target = "_blank";
            a.innerHTML = fileName;
            li.appendChild(a);

            // Allows for download of files that come up in search (Almost identical code from the collapsible file tree, changed so works for searching) 
            var dwnBtn = document.createElement("a");
            dwnBtn.href = "#";
            dwnBtn.style.marginLeft = "5px";
            dwnBtn.innerHTML = "↓";
            dwnBtn.setAttribute("data-file", fileName);
            dwnBtn.onclick = (function(a, dwnBtn) {
                return function(e) {
                    e.preventDefault();
                    fetch(a.href)
                        .then(function(response) { return response.blob(); })
                        .then(function(blob) {
                            var url = window.URL.createObjectURL(blob);
                            var tempLink = document.createElement("a");
                            tempLink.style.display = "none";
                            tempLink.href = url;
                            tempLink.download = dwnBtn.getAttribute("data-file");
                            document.body.appendChild(tempLink);
                            tempLink.click();
                            document.body.removeChild(tempLink);
                            window.URL.revokeObjectURL(url);
                        })
                        .catch(function(err) {
                            console.error("Download error:", err);
                        });
                };
            })(a, dwnBtn);
            li.appendChild(dwnBtn);

            searchResults.appendChild(li); //Allows for listed items to appear in "searchResults"
        }
    }
}
