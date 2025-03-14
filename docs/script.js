var directoryData = []; // Stores the full directory list
var repoRoot = "docs/"; // Adjust if necessary based on GitHub Pages structure

// Load directory.json and display only top-level folders
function loadFiles() {
    fetch("directory.json")
        .then(response => response.json())
        .then(function(data) {
            directoryData = data;
            var topFolders = directoryData.filter(item => isTopLevel(item.Path));
            showFiles(topFolders, document.getElementById("fileList"));
        })
        .catch(function(error) {
            console.log("Error loading directory.json", error);
        });
}

// Check if a folder is a top-level folder inside "TTP-Procedure-Graphs"
function isTopLevel(path) {
    return path.split("/").length === 2; // Ensures only direct children of "TTP-Procedure-Graphs"
}

// Display files and folders
function showFiles(filesList, parentElement) {
    parentElement.innerHTML = ""; // Clear before adding

    filesList.forEach(function(item) {
        var listItem = document.createElement("li");

        if (item.IsFolder) {
            listItem.className = "folder";
            listItem.textContent = "📁 " + item.Name;

            // Create hidden sublist
            var subList = document.createElement("ul");
            subList.className = "hidden";
            listItem.appendChild(subList);

            // Toggle open/close when clicking the folder
            listItem.onclick = function(event) {
                event.stopPropagation();
                subList.classList.toggle("hidden");

                if (subList.innerHTML === "") {
                    var filtered = directoryData.filter(function(subItem) {
                        return subItem.Path.startsWith(item.Path + "/") && subItem.Path !== item.Path;
                    });
                    showFiles(filtered, subList);
                }
            };
        } else {
            listItem.className = "file";
            listItem.textContent = "📄 " + item.Name;

            // Clicking a file should open it properly
            listItem.onclick = function(event) {
                event.stopPropagation();
                window.open(repoRoot + item.Path, "_blank"); // Ensure correct GitHub Pages URL
            };
        }

        parentElement.appendChild(listItem);
    });
}

// Search function: Finds matching folders and files
function searchFiles() {
    var query = document.getElementById("search").value.toLowerCase();
    var filtered = directoryData.filter(item => item.Path.toLowerCase().includes(query));
    showFiles(filtered, document.getElementById("fileList"));
}

// Load files when the page loads
window.onload = loadFiles;
