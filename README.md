# Macroeconomic Researcher Dashboard

This project is a **Macroeconomic Researcher Dashboard** designed as a "Hackathon for Web development Course (CMPE 280-SJSU)" to provide a user-friendly interface for analyzing time-series data and visualizations related to macroeconomic, agricultural, and debt service indicators. The dashboard also integrates **AI-driven insights** using the **OpenAI API** to enhance the user experience.

---

## Features

- **Dynamic Data Visualizations**:
  - Drag-and-drop chart generation for indicators such as GDP, FDI inflows/outflows, and agricultural contributions.
  - Time-series graphs with interactive sliders for exploring data over multiple years.

- **Annotation & Commenting**:
  - Allows users to annotate charts and add comments to subsets of data.
  - Dynamically displays comments for each category and subset.

- **AI Integration**:
  - Integrated with OpenAI's API through **LangChain** for generating insights and answering user queries.

- **Sankey & Pie Charts**:
  - Sankey diagrams and pie charts to visualize trade data, agricultural imports, and macroeconomic relationships.

- **Backend API**:
  - Built with **FastAPI** to provide RESTful endpoints for retrieving filtered data and processing user inputs.

- **Dataset Cleaning**:
  - Automatic cleaning of large CSV datasets to handle missing or incorrect values for reliable analytics.

---

## Technologies Used

- **Frontend**: 
  - HTML, CSS, JavaScript
  - Plotly.js for interactive visualizations
  - LocalStorage for saving and displaying user comments

- **Backend**:
  - **FastAPI** for RESTful APIs
  - **LangChain** for OpenAI-powered retrieval and answering
  - **Pandas** for data preprocessing
  - **PyPDF2** for combining and extracting text from PDF datasets

- **AI & Embeddings**:
  - OpenAI API for natural language understanding
  - FAISS for efficient vector-based retrieval

- **Data Storage**:
  - Local CSV datasets for macroeconomic, agricultural, and debt service data

---

## Installation

### Prerequisites
- Python 3.8+
- Node.js (for frontend hosting)
- OpenAI API key

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/macro-dashboard.git
   cd macro-dashboard
