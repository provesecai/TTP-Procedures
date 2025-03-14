var directoryData = []; // ✅ Global variable to store API data
var repoOwner = "provsecai"; // ✅ Your GitHub username
var repoName = "TTP-Procedures"; // ✅ Your repository name
var branch = "main"; // ✅ Correct branch

async function loadFiles() {
    let apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/TTP-Procedure-Graphs?ref=${branch}`;

    try {
        let response = await fetch(apiUrl);
        let data = await response.json();

        console.log("GitHub API Data:", data); // Debugging log

        if (Array.isArray(data)) {
            directoryData = data; // ✅ Store API results in global variable
            showFiles(data, document.getElementById("fileList"));
        } else {
            console.error("Failed to fetch repository contents. Check API limits.");
        }
    } catch (error) {
        console.error("Error fetching GitHub repo structure:", error);
    }
}

// ✅ Search function (filters dynamically loaded GitHub API data)
function searchFiles() {
    var query = document.getElementById("search").value.toLowerCase();
    console.log("Search query:", query); // Debugging log

    if (query.trim() === "") {
        console.log("Search empty, resetting view..."); // Debugging log
        loadFiles(); // Reloads original structure when search is cleared
        return;
    }

    var filtered = directoryData.filter(item => item.path.toLowerCase().includes(query));
    
    console.log("Search results:", filtered.length, filtered); // Debugging log
    showFiles(filtered, document.getElementById("fileList"));
}

// ✅ Function to display files and folders
function showFiles(filesList, parentElement) {
    parentElement.innerHTML = ""; // Clear before adding

    if (filesList.length === 0) {
        console.log("No files to display"); // Debugging log
        return;
    }

    filesList.forEach(function(item) {
        var listItem = document.createElement("li");

        if (item.type === "dir") { // 🔹 Folder
            listItem.className = "folder";
            listItem.textContent = "📁 " + item.name;

            // Create hidden sublist
            var subList = document.createElement("ul");
            subList.className = "hidden";
            listItem.appendChild(subList);

            // Clicking a folder loads its contents
            listItem.onclick = async function(event) {
                event.stopPropagation();
                subList.classList.toggle("hidden");

                if (subList.innerHTML === "") {
                    console.log("Expanding folder:", item.path); // Debugging log
                    let subFiles = await fetchGitHubContents(item.path);
                    showFiles(subFiles, subList);
                }
            };
        } else { // 🔹 File
            listItem.className = "file";
            listItem.textContent = "📄 " + item.name;

            // ✅ FIX: Construct the correct GitHub Pages file URL
            let fileUrl = `https://${repoOwner}.github.io/${repoName}/${item.path}`;

            // Clicking a file should open it properly
            listItem.onclick = function(event) {
                event.stopPropagation();
                console.log("Opening file:", fileUrl); // Debugging log
                window.open(fileUrl, "_blank"); // ✅ Fixed GitHub Pages URL
            };
        }

        parentElement.appendChild(listItem);
    });
}

// ✅ Function to fetch subfolders dynamically
async function fetchGitHubContents(path) {
    let apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}?ref=${branch}`;

    try {
        let response = await fetch(apiUrl);
        let data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error fetching folder contents:", error);
        return [];
    }
}

// ✅ Load files when the page loads
window.onload = loadFiles;
