from fastapi import FastAPI, Query
import pandas as pd
from fastapi.responses import JSONResponse

app = FastAPI()
file_path = "./dataset/import.csv"
df = pd.read_csv(file_path)

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
    
    return JSONResponse(content=data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
