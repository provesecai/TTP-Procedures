var directoryData = []; // Stores all files and folders
var repoRoot = "docs/"; // Adjust if needed

// Load directory.json and display only top-level folders
function loadFiles() {
    fetch("directory.json")
        .then(response => response.json())
        .then(function(data) {
            directoryData = data;
            resetToParentFolders(); // Show only main folders on page load
        })
        .catch(function(error) {
            console.log("Error loading directory.json", error);
        });
}

// Show only the **top-level folders inside "TTP-Procedure-Graphs"**
function resetToParentFolders() {
    var parentFolders = directoryData.filter(item => isTopLevelFolder(item.Path));
    showFiles(parentFolders, document.getElementById("fileList"));
}

// Check if a folder is **directly inside "TTP-Procedure-Graphs"**
function isTopLevelFolder(path) {
    return path.startsWith("TTP-Procedure-Graphs/") && path.split("/").length === 2;
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

            // Clicking a folder expands its contents
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
                window.open(repoRoot + item.Path, "_blank");
            };
        }

        parentElement.appendChild(listItem);
    });
}

// Search function: Filters both files and folders
function searchFiles() {
    var query = document.getElementById("search").value.toLowerCase();

    if (query.trim() === "") {
        resetToParentFolders(); // When search is empty, reset to only parent folders
    } else {
        var filtered = directoryData.filter(item => item.Path.toLowerCase().includes(query));
        showFiles(filtered, document.getElementById("fileList"));
    }
}

// Load files when the page loads
window.onload = loadFiles;
