var stuff = []; // Global variable to store file data

// Load directory.json
function getData() {
    fetch("directory.json")
        .then(response => response.json())
        .then(function(data) {
            stuff = data;
            showFiles(stuff);
        })
        .catch(function(error) {
            console.log("Error loading directory.json");
        });
}

// Display files and folders
function showFiles(filesStuff) {
    var container = document.getElementById("fileList");
    container.innerHTML = ""; // Clears before adding

    for (var i = 0; i < filesStuff.length; i++) {
        var temp = document.createElement("div");

        if (filesStuff[i].IsFolder) {
            temp.innerHTML = "** Folder: " + filesStuff[i].Name; // Adds folder label
            temp.style.color = "brown"; 
        } else {
            temp.innerHTML = "File: " + filesStuff[i].Name;
            temp.style.color = "blue";

            // Click to open file
            temp.onclick = function() {
                window.open(filesStuff[i].Path, "_blank");
            };
        }

        container.appendChild(temp);
    }
}

// Search function
function searchFiles() {
    var searchText = document.getElementById("searchBox").value.toLowerCase();
    
    var filteredFiles = [];
    for (var j = 0; j < stuff.length; j++) {
        if (stuff[j].Path.toLowerCase().includes(searchText)) {
            filteredFiles.push(stuff[j]);
        }
    }

    showFiles(filteredFiles); // Show filtered results
}

window.onload = getData;
