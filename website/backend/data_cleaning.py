import pandas as pd

# Load the CSV file
file_path = './dataset/total_debt_service.csv'
data = pd.read_csv(file_path)

# Replace ".." with NaN to identify missing values correctly
data.replace("..", pd.NA, inplace=True)

# Drop rows with any missing values
cleaned_data = data.dropna()

# Save the cleaned data to a new CSV file
cleaned_file_path = './dataset/cleaned_total_debt_service.csv'
cleaned_data.to_csv(cleaned_file_path, index=False)

print(f"Cleaned file saved to: {cleaned_file_path}")
