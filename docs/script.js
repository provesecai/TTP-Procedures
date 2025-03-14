var directoryData = []; // Stores the full directory list

// Loads directory.json and displays files
function loadFiles() {
    fetch("directory.json")
        .then(response => response.json())
        .then(function(data) {
            directoryData = data;
            showFiles(directoryData, document.getElementById("fileList"));
        })
        .catch(function(error) {
            console.log("Error loading directory.json", error);
        });
}

// Creates collapsible file structure
function showFiles(filesList, parentElement) {
    parentElement.innerHTML = ""; // Clear before adding
    
    filesList.forEach(function(item) {
        var listItem = document.createElement("li");
        
        if (item.IsFolder) {
            listItem.className = "folder";
            listItem.textContent = "📁 " + item.Name;

            // Create sublist for child items
            var subList = document.createElement("ul");
            subList.className = "hidden"; // Hidden by default
            listItem.appendChild(subList);
            
            listItem.onclick = function(event) {
                event.stopPropagation(); // Prevent triggering parent clicks
                subList.classList.toggle("hidden");
                if (subList.innerHTML === "") {
                    // Show files within this folder
                    var filtered = directoryData.filter(function(subItem) {
                        return subItem.Path.startsWith(item.Path + "/") && subItem.Path !== item.Path;
                    });
                    showFiles(filtered, subList);
                }
            };
        } else {
            listItem.className = "file";
            listItem.textContent = "📄 " + item.Name;
            listItem.onclick = function() {
                window.open(item.Path, "_blank");
            };
        }

        parentElement.appendChild(listItem);
    });
}

// Filters files based on search input
function searchFiles() {
    var query = document.getElementById("search").value.toLowerCase();
    var filtered = directoryData.filter(function(item) {
        return item.Path.toLowerCase().includes(query);
    });
    showFiles(filtered, document.getElementById("fileList"));
}

// Load files on page load
window.onload = loadFiles;
