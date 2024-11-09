/************************************************************************************** */

// Declare global variables
let selectedCountry = 'India';
let selectedGraphId = '';



// Store CSV data in a global object
let csvData = {};

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


// Load CSV files asynchronously
function loadCSVData() {
    const csvFiles = {
        'gdp_usd': '../backend/dataset/gdp_usd.csv',
        'fdi_inflows': '../backend/dataset/fdi_inflows.csv',
        'fdi_outflows': '../backend/dataset/fdi_outflows.csv',

        'credit': '../backend/dataset/gdp_percent.csv',
        'agricultural_contribution': '../backend/dataset/agricultural_contribution.csv',
        'fertilizer_consumption_production': '../backend/dataset/fertilizer_consumption_production.csv',
        'fertilizer_consumption': '../backend/dataset/fertilizer_consumption.csv',
        
        'reserves': '../backend/dataset/debt_service.csv',
        'gni': '../backend/dataset/gni.csv',
        'total_debts': '../backend/dataset/total_debt.csv'
        
    };

    // Fetch and parse each CSV file
    for (let key in csvFiles) {
        fetch(csvFiles[key])
            .then(response => response.text())
            .then(data => {
                const parsedData = parseCSV(data);
                csvData[key] = parsedData; // Store parsed data in the global csvData object
            })
            .catch(error => console.error(`Error loading CSV file ${key}:`, error));
    }
}

// Parse CSV data into a usable format
function parseCSV(csvText) {
    const rows = csvText.split("\n");
    const headers = rows[0].split(",");
    const data = rows.slice(1).map(row => {
        const values = row.split(",");
        let obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index].trim();
        });
        return obj;
    });
    return data;
}

// Store selected country
function updateCountry() {
    selectedCountry = document.getElementById('country-selector').value;
    document.getElementById('country-flag').style.display = selectedCountry ? 'inline' : 'none';
}

// Allow drop on the chart area
function allowDrop(event) {
    event.preventDefault();
}

// Handle drag event
function drag(event) {
    // Store the ID of the dragged item (graph type)
    event.dataTransfer.setData("text", event.target.id);
    console.log("Dragging", event.target.id);
    

    selectedGraphId = event.dataTransfer.getData("text");
    generateGraph();
}

// Handle drop event
function drop(event) {
    event.preventDefault();
    selectedGraphId = event.dataTransfer.getData("text");
    console.log("Dropping", event.target.id);

    // Ensure a valid country and graph are selected
    if (!selectedCountry || !selectedGraphId) {
        alert("Please select a country and a graph type.");
    }
}
async function loadGraphs() {
    const country = document.getElementById("two-country-selector").value;
    const year = document.getElementById("year-selector").value;
    const crop = document.getElementById("crop-selector").value;

    if (!country || !year || !crop) {
        // alert("Please select a country, year, and crop.");
        return;
    }

    console.log("Selected Values:", country, year, crop);
    const response = await fetch(`http://localhost:8801/sankey-data?country=${country}&year=${year}&crop=${crop}`);
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
    for (let i = 0; i < data.target.length; i++) {
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

    const sankeyLayout = {
        title: `${country} ${crop} Imports (${year})`,
        font: { size: 10 }
    };

    // Plot the Sankey diagram
    Plotly.newPlot("sankey-chart", [sankeyData], sankeyLayout);

    // **Process data for the pie chart**

    // Calculate total import value
    const totalValue = data.value.reduce((sum, val) => sum + val, 0);

    // Arrays to hold processed values and labels
    const pieValues = [];
    const pieLabels = [];
    const pieColors = [];

    // Variables to accumulate 'Others' category
    let othersValue = 0;
    const othersColor = 'grey';

    // Process each slice
    for (let i = 0; i < data.value.length; i++) {
        const percentage = (data.value[i] / totalValue) * 100;

        if (percentage < 1) {
            // Accumulate the values for 'Others'
            othersValue += data.value[i];
        } else {
            // Include slices with percentage >= 1%
            pieValues.push(data.value[i]);
            pieLabels.push(data.target[i]);
            pieColors.push(nodeColors[i + 1]); // Adjust index for colors
        }
    }

    // Add 'Others' category if applicable
    if (othersValue > 0) {
        pieValues.push(othersValue);
        pieLabels.push('Others');
        pieColors.push(othersColor);
    }

    // Prepare data for the pie chart
    const pieData = [{
        values: pieValues,
        labels: pieLabels,
        type: 'pie',
        marker: {
            colors: pieColors
        },
        textinfo: 'label+percent',
        textposition: 'inside',
        insidetextorientation: 'radial',
        hoverinfo: 'label+value+percent',
        textfont: {
            size: 12,
            color: 'white'
        }
    }];

    const pieLayout = {
        title: `Import Shares of ${crop} to ${country} (${year})`,
        height: 400,
        width: 400,
        showlegend: false
    };

    // Plot the pie chart
    Plotly.newPlot("pie-chart", pieData, pieLayout);
}

// Event listener for updating the chart
document.getElementById("two-country-selector").addEventListener("change", loadGraphs);
document.getElementById("year-selector").addEventListener("change", loadGraphs);
document.getElementById("crop-selector").addEventListener("change", loadGraphs);

// Save a comment to localStorage
function saveComment(category, subset, comment) {
    if (!category || !subset || !comment) {
        alert("Please fill out all fields before submitting.");
        return;
    }

    // Call function to generate graph
    generateGraph();
}

// Generate the Plotly graph
function generateGraph() {
    // Get the selected CSV data based on the graphId
    const data = csvData[selectedGraphId];
    if (!data) {
        alert("Graph data not found.");
        return;
    }

    // Filter data based on the selected country
    const countryData = data.filter(row => row.Country === selectedCountry);

    // If country data is found, create the graph
    if (countryData.length > 0) {
        const years = Object.keys(countryData[0]).filter(key => key !== 'Country');
        const timeSeriesData = years.map(year => parseFloat(countryData[0][year]));

        // Create a Plotly graph
        const trace = {
            x: years,
            y: timeSeriesData,
            mode: 'lines+markers',
            name: selectedCountry
        };

        const layout = {
            title: `Time Series ${selectedGraphId.split("_").join(" ").toUpperCase()} Data for ${selectedCountry}`,
            xaxis: { title: 'Year' },
            yaxis: { title: 'Y-Axis' },
            template: 'plotly_dark'
        };

        // Render the Plotly graph
        document.querySelector('#chart-drop-area').innerHTML = '';
        Plotly.newPlot('chart-drop-area', [trace], layout);
    } else {
        alert("No data found for the selected country.");
    }
}


// Function to generate graph for a specific year
function animateGraph(yearIndex) {
    // Get the selected CSV data based on the graphId
    const data = csvData[selectedGraphId];
    if (!data) {
        alert("Graph data not found.");
        return;
    }

    // Filter data based on the selected country
    const countryData = data.filter(row => row.Country === selectedCountry);

    // If country data is found, create the graph
    if (countryData.length > 0) {
        const years = Object.keys(countryData[0]).filter(key => key !== 'Country');
        const timeSeriesData = years.map(year => parseFloat(countryData[0][year]));

        // Limit the data to the current year
        const currentYearData = timeSeriesData.slice(0, yearIndex + 1);
        let currentYears = years.slice(0, yearIndex + 1);

        // Create a Plotly graph
        const trace = {
            x: currentYears,
            y: currentYearData,
            mode: 'lines+markers',
            name: selectedCountry
        };

        const layout = {
            title: `Time Series Data for ${selectedCountry}`,
            xaxis: { title: 'Year' },
            yaxis: { title: 'Y-Axis' },
            template: 'plotly_dark'
        };

        // Render the Plotly graph
        document.querySelector('#chart-drop-area').innerHTML = '';
        Plotly.newPlot('chart-drop-area', [trace], layout);
        console.log(currentYears);
        document.querySelector('#time-slider').value = currentYears[currentYears.length-1];
    } else {
        alert("No data found for the selected country.");
    }
}


// Initialize by loading CSV files
loadCSVData();



// Event listener for the Play button
document.querySelector('.play-button').addEventListener('click', () => {
    if (isPlaying) {
        stopAnimation(); // If already playing, stop the animation
    } else {
        console.log("play clicked");
        startAnimation(); // Start the animation
    }
});

const years = 1960;
let currentYearIndex = 0;
let intervalId;
let isPlaying = false;

// Function to start the animation
function startAnimation() {
    if (isPlaying) return; // Prevent multiple clicks

    isPlaying = true;
    currentYearIndex = 0;  // Reset to the first year (1960)

    // Start the animation: update every 100ms
    intervalId = setInterval(() => {
        // Generate the graph with the current year
        animateGraph(currentYearIndex);

        // Increment year index
        currentYearIndex++;

        // Stop the animation when we reach 2024
        if (currentYearIndex > years.length) {
            clearInterval(intervalId);
            isPlaying = false;
        }
    }, 100); // Update every 100ms
}

// Function to stop the animation
function stopAnimation() {
    clearInterval(intervalId);
    isPlaying = false;
}
// Toggle between Sankey chart and time series graph
document.getElementById('importExportButton').addEventListener('click', function() {
    const timeSeriesContainer = document.getElementById('time-series-graph-container');
    const sankeyContainer = document.getElementById('sankey-chart-container');
    
    if (sankeyContainer.style.display === 'none' || sankeyContainer.style.display === '') {
        // Show the Sankey chart and hide the time series graph
        sankeyContainer.style.display = 'block';
        timeSeriesContainer.style.display = 'none';
        document.querySelector("#country-selector").style.display = 'none';
        document.querySelector(".sidebar-ul").style.display = 'none';
    } else {
        // Hide the Sankey chart and show the time series graph
        sankeyContainer.style.display = 'none';
        timeSeriesContainer.style.display = 'block';
        document.querySelector("#country-selector").style.display = 'block';
        document.querySelector(".sidebar-ul").style.display = 'block';
    }
});

// Chat UI functions 
function toggleChat() {
    const modal = document.getElementById('chatModal');
    modal.classList.toggle('show-modal');
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        askQuestion();
    }
}

async function askQuestion() {
    const inputElement = document.getElementById("user-input");
    const question = inputElement.value.trim();
    if (question === "") return;

    const chatBox = document.getElementById("chat-box");
    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user-bubble";
    userBubble.textContent = question;
    chatBox.appendChild(userBubble);

    inputElement.value = "";

    const botBubble = document.createElement("div");
    botBubble.className = "chat-bubble bot-bubble";
    botBubble.textContent = "Thinking....";
    chatBox.appendChild(botBubble);

    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch("http://127.0.0.1:8000/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: question }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            if (botBubble.textContent === "Thinking....") {
                botBubble.textContent = '';
            }
            botBubble.textContent += chunk;

            chatBox.scrollTop = chatBox.scrollHeight;
        }
    } catch (error) {
        console.error("Error fetching response:", error);
        botBubble.textContent = "An error occurred. Please try again.";
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}

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
        commentsDiv.innerHTML += `<p>${category}, ${subset}: ${comment}</p>`;
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
