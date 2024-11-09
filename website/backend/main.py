from fastapi import FastAPI, Request, Query
import pandas as pd
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],   # Allow all methods
    allow_headers=["*"],   # Allow all headers
)

file_path = "./dataset/import.csv"
df = pd.read_csv(file_path)

@app.options("/{path_name:path}")
async def options_handler(path_name: str, request: Request):
    """
    This handler will respond to all OPTIONS requests with a 200 OK.
    """
    return Response(status_code=200)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Macroeconomic Researcher Food Security Time Series and Large Language Chat GPT Dashboard!"}

@app.get("/sankey-data")
async def get_sankey_data(
    country: str = Query(..., description="Country for data filtering, e.g., Egypt or Saudi Arabia"),
    year: int = Query(..., description="Year for data filtering"),
    crop: str = Query(..., description="Crop type for data filtering, e.g., Wheat")
):
    # Filter the data based on the query parameters
    filtered_data = df[
        (df['Reporter Countries'] == country) &
        (df['Year'] == year) &
        (df['Item'] == crop)
    ]

    print(f"SELECTED VALUES {country} {year} {crop}")
    # Prepare data for the Sankey diagram
    data = {
        "source": [country] * len(filtered_data),  # All links start from the selected country
        "target": filtered_data['Partner Countries'].tolist(),
        "value": filtered_data['Value'].tolist()
    }
    
    print(data)
    
    return JSONResponse(content=data)

