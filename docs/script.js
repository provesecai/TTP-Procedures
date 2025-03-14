var directoryData = []; // Stores the full directory list
var repoRoot = "docs/"; // Adjust if needed

// Load directory.json and display only top-level folders
function loadFiles() {
    fetch("directory.json")
        .then(response => response.json())
        .then(function(data) {
            directoryData = data;
            console.log("Loaded directory data:", directoryData); // Debugging log
            resetToParentFolders(); // Show only main folders on page load
        })
        .catch(function(error) {
            console.error("Error loading directory.json", error);
        });
}

// Show only the **top-level folders inside "TTP-Procedure-Graphs"**
function resetToParentFolders() {
    console.log("Resetting to only show parent folders...");
    var parentFolders = directoryData.filter(item => isTopLevelFolder(item.Path));
    console.log("Parent folders found:", parentFolders); // Debugging log
    showFiles(parentFolders, document.getElementById("fileList"));
}

// Check if a folder is **directly inside "TTP-Procedure-Graphs"**
function isTopLevelFolder(path) {
    return path.startsWith("TTP-Procedure-Graphs/") && path.split("/").length === 2;
}

// Display files and folders
function showFiles(filesList, parentElement) {
    parentElement.innerHTML = ""; // Clear before adding

    if (filesList.length === 0) {
        console.log("No files to display"); // Debugging log
        return;
    }

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
                    console.log("Expanding folder:", item.Path); // Debugging log
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
                console.log("Opening file:", repoRoot + item.Path); // Debugging log
                window.open(repoRoot + item.Path, "_blank");
            };
        }

        parentElement.appendChild(listItem);
    });
}

// Search function: Filters both files and folders
function searchFiles() {
    var query = document.getElementById("search").value.toLowerCase();
    console.log("Search query:", query); // Debugging log

    if (query.trim() === "") {
        console.log("Search empty, resetting view..."); // Debugging log
        resetToParentFolders(); // When search is empty, reset to only parent folders
    } else {
        var filtered = directoryData.filter(item => item.Path.toLowerCase().includes(query));
        console.log("Search results:", filtered); // Debugging log
        showFiles(filtered, document.getElementById("fileList"));
    }
}

// Load files when the page loads
window.onload = loadFiles;
