var repoOwner = "provesecai"; // ✅ Your GitHub username
var repoName = "TTP-Procedures"; // ✅ Your repository name
var branch = "main"; // ✅ Change if using a different branch

var repoRoot = `https://${repoOwner}.github.io/${repoName}/`; // ✅ Fixed Template Literal

// Load GitHub directory contents
async function loadFiles() {
    let apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/TTP-Procedure-Graphs?ref=${branch}`; // ✅ Fixed Template Literal

    try {
        let response = await fetch(apiUrl);
        let data = await response.json();

        console.log("GitHub API Data:", data); // Debugging log
        
        if (Array.isArray(data)) {
            showFiles(data, document.getElementById("fileList"));
        } else {
            console.error("Failed to fetch repository contents. Check API limits.");
        }
    } catch (error) {
        console.error("Error fetching GitHub repo structure:", error);
    }
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

            // Clicking a file should open it properly
            listItem.onclick = function(event) {
                event.stopPropagation();
                console.log("Opening file:", repoRoot + item.path); // Debugging log
                window.open(repoRoot + item.path, "_blank");
            };
        }

        parentElement.appendChild(listItem);
    });
}

// Fetch files from GitHub API dynamically
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

// Search function: Not needed as everything updates dynamically, but you can add filtering if required

// Load files when the page loads
window.onload = loadFiles;
