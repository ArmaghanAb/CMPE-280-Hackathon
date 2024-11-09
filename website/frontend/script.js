

/************************************************************************************** */

// Toggle dropdown visibility
function toggleDropdown() {
    const dropdown = document.getElementById("dropdownOptions");
    // Toggle display between 'block' and 'none'
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
    console.log("Dropdown toggled");
}

// Close dropdown if clicked outside
window.addEventListener("click", function(event) {
    const dropdown = document.getElementById("dropdownOptions");
    const button = document.querySelector(".annotation-button");

    // Only close the dropdown if it's open and the click is outside both the button and the dropdown
    if (dropdown.style.display === "block" && !dropdown.contains(event.target) && !button.contains(event.target)) {
        dropdown.style.display = "none";
        console.log("Dropdown closed by outside click");
    }
});


// Define subsets for each category
const subsets = {
    Macroeconomic: ["GDP (USD)", "FDI Inflows (USD)", "FDI Outflows (USD)"],
    Agricultural: ["Contribution of Agri (% GDP)", "Credit", "Fertilizers", "Fertilizers PROD"],
    "Debt Services": ["Reservers", "GNI", "Total Debts (%)"]
};

// Populate the subset dropdown based on the selected category
function populateSubsets() {
    const categorySelect = document.getElementById("category");
    const subsetSelect = document.getElementById("subset");
    const selectedCategory = categorySelect.value;

    // Clear the subset dropdown
    subsetSelect.innerHTML = "";

    // Add default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Choose a subset";
    subsetSelect.appendChild(defaultOption);

    // If a category is selected, add corresponding subsets
    if (subsets[selectedCategory]) {
        subsets[selectedCategory].forEach(subset => {
            const option = document.createElement("option");
            option.value = subset;
            option.textContent = subset;
            subsetSelect.appendChild(option);
        });
    }
    // Clear comments display if category changes
    document.getElementById("comments").innerHTML = "";
}

// Display comments when a subset is selected
document.getElementById("subset").addEventListener("change", () => {
    const category = document.getElementById("category").value;
    const subset = document.getElementById("subset").value;

    if (subset) {
        displayComments(category, subset);
    }
});

// Save a comment to localStorage
function saveComment(category, subset, comment) {
    if (!category || !subset || !comment) {
        alert("Please fill out all fields before submitting.");
        return;
    }

    const key = `${category}-${subset}`;
    let comments = JSON.parse(localStorage.getItem(key)) || [];
    comments.push(comment);
    localStorage.setItem(key, JSON.stringify(comments));
    alert("Comment saved successfully!");
    displayComments(category, subset); 
}

// Retrieve comments for a specific category and subset
function getComments(category, subset) {
    const key = `${category}-${subset}`;
    const comments = JSON.parse(localStorage.getItem(key)) || [];
    return comments;
}

// Display comments on the page for a specific category and subset
function displayComments(category, subset) {
    const comments = getComments(category, subset);
    const commentsDiv = document.getElementById("comments");
    
    commentsDiv.innerHTML = "<strong>Comments:</strong><br>";
    comments.forEach(comment => {
        commentsDiv.innerHTML += `<p>${comment}</p>`;
    });
}

// Function to handle comment submission from the form
function submitAnnotation() {
    const category = document.getElementById("category").value;
    const subset = document.getElementById("subset").value;
    const comment = document.getElementById("comment").value;

    saveComment(category, subset, comment);
    
    // Clear the comment input field after submission
    document.getElementById("comment").value = "";
}

