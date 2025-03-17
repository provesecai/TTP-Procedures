document.addEventListener("DOMContentLoaded", async function () {
    const fileList = document.getElementById("file-list");

    // Setting up GitHub API, to get files automatically
    const repoOwner = "provesecai"; //GitHub Username
    const repoName = "TTP-Procedures"; //Repository Name 
    const baseApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`;

    //Ensuring config.js exists and has a token 
    let headers = {};
    if (typeof config !== "undefined" && config.githubToken) {
        headers = {
            "Authorization": `token ${config.githubToken}`,
            "Accept": "application/vnd.github.v3+json"
        };
    }

    // Function to get files from GitHub
    function fetchFiles(folderPath) {
        let url = baseApiUrl;
        if (folderPath) {
            url += `/${folderPath}`; // Add folder path to API URL so it recognises it and can list
        }

        fetch(url, {headers}) //headers uses PAT token
            .then(response => {
                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status}`); //Logs errors, good practice for debugging in future
                }
                return response.json(); // Convert response to JSON
            })
            .then(files => {
                files.forEach(file => {
                    if (file.type === "file" && file.name.endsWith(".txt")) {
                        // If it's a .txt file, add it to the list on website
                        let listItem = document.createElement("li");
                        let link = document.createElement("a");
                        link.href = file.download_url; // Direct link to the file
                        link.textContent = file.path; // Show full path of file showing
                        listItem.appendChild(link);
                        fileList.appendChild(listItem);
                    } else if (file.type === "dir") {
                        // If it's a folder, call fetchFiles again (recursion)
                        fetchFiles(file.path);
                    }
                });
            })
            .catch(error => {
                console.error(`Error fetching files:`, error);
            });
    }

    // Start fetching from the root directory
    fetchFiles("");
});