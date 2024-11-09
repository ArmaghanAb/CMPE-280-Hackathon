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
}

// Toggle between Sankey chart and time series graph
document.getElementById('importExportButton').addEventListener('click', function() {
    const timeSeriesContainer = document.getElementById('time-series-graph-container');
    const sankeyContainer = document.getElementById('sankey-chart-container');
    
    if (sankeyContainer.style.display === 'none' || sankeyContainer.style.display === '') {
        // Show the Sankey chart and hide the time series graph
        sankeyContainer.style.display = 'block';
        timeSeriesContainer.style.display = 'none';
    } else {
        // Hide the Sankey chart and show the time series graph
        sankeyContainer.style.display = 'none';
        timeSeriesContainer.style.display = 'block';
    }
});

async function loadSankeyData() {
    const country = document.getElementById("two-country-selector").value;
    const year = document.getElementById("year-selector").value;
    const crop = document.getElementById("crop-selector").value;

    if (!country || !year || !crop) {
        // alert("Please select a country, year, and crop.");
        return;
    }

    console.log("Selected Values:", country, year, crop);
    const response = await fetch(`http://localhost:8000/sankey-data?country=${country}&year=${year}&crop=${crop}`);
    const data = await response.json();

    // Function to generate a distinct color for each node
    function generateColor(index, totalNodes) {
        const hue = (index * 360) / totalNodes; // Evenly distribute hues
        return `hsl(${hue}, 70%, 50%)`;
    }

    // Total number of nodes (source + targets)
    const totalNodes = data.target.length + 1;

    // Generate colors for all nodes
    const nodeColors = ["lightblue"];
    for (let i = 0; i < totalNodes; i++) {
        nodeColors.push(generateColor(i, totalNodes));
    }

    // Define the Sankey data
    const sankeyData = {
        type: "sankey",
        orientation: "h",
        node: {
            pad: 15,
            thickness: 20,
            line: {
                color: "black",
                width: 0.5
            },
            label: [country, ...data.target],
            color: nodeColors // Assign the generated colors
        },
        link: {
            source: Array(data.target.length).fill(0),
            target: data.target.map((_, i) => i + 1),
            value: data.value
        }
    };

    const layout = {
        title: `${country} ${crop} Imports (${year})`,
        font: {
            size: 10
        }
    };

    Plotly.newPlot("sankey-chart", [sankeyData], layout);
}

// Event listener for updating the chart
document.getElementById("two-country-selector").addEventListener("change", loadSankeyData);
document.getElementById("year-selector").addEventListener("change", loadSankeyData);
document.getElementById("crop-selector").addEventListener("change", loadSankeyData);


