/************************************************************************************** */

// Declare global variables
let selectedCountry = 'India';
let selectedGraphId = '';



// Store CSV data in a global object
let csvData = {};

// Load CSV files asynchronously
function loadCSVData() {
    const csvFiles = {
        'gdp_usd': '/280_hackathon/website/backend/dataset/gdp_usd.csv',
        'fdi_inflows': '/280_hackathon/website/backend/dataset/fdi_inflows.csv',
        'fdi_outflows': '/280_hackathon/website/backend/dataset/fdi_outflows.csv',

        'credit': '/280_hackathon/website/backend/dataset/gdp_percent.csv',
        'agricultural_contribution': '/280_hackathon/website/backend/dataset/agricultural_contribution.csv',
        'fertilizer_consumption_production': '/280_hackathon/website/backend/dataset/fertilizer_consumption_production.csv',
        'fertilizer_consumption': '/280_hackathon/website/backend/dataset/fertilizer_consumption.csv',
        
        'reserves': '/280_hackathon/website/backend/dataset/debt_service.csv',
        'gni': '/280_hackathon/website/backend/dataset/gni.csv',
        'total_debts': '/280_hackathon/website/backend/dataset/total_debt.csv'
        
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
            title: `Time Series Data for ${selectedCountry}`,
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