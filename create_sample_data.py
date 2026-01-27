"""
Create Sample Dataset with Missing Values
------------------------------------------
This script generates a sample dataset with intentionally introduced
missing values for practicing data cleaning techniques.
"""

import pandas as pd
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)

def create_sample_dataset(n_rows=1000, save_path='dataset.csv'):
    """
    Generate a sample dataset with missing values.
    
    Parameters:
    -----------
    n_rows : int
        Number of rows to generate
    save_path : str
        Path to save the CSV file
    """
    
    print("=" * 60)
    print("CREATING SAMPLE DATASET")
    print("=" * 60)
    
    # Generate sample data
    data = {
        'id': range(1, n_rows + 1),
        'age': np.random.normal(35, 10, n_rows),
        'salary': np.random.exponential(50000, n_rows),
        'experience': np.random.normal(10, 5, n_rows),
        'department': np.random.choice(['Sales', 'IT', 'HR', 'Marketing', 'Finance'], n_rows),
        'city': np.random.choice(['New York', 'London', 'Tokyo', 'Mumbai', 'Berlin'], n_rows),
        'performance_score': np.random.uniform(1, 10, n_rows),
        'education': np.random.choice(['High School', 'Bachelor', 'Master', 'PhD'], n_rows),
    }
    
    df = pd.DataFrame(data)
    
    # Make sure numerical values are realistic
    df['age'] = df['age'].clip(lower=18, upper=70)
    df['salary'] = df['salary'].clip(lower=20000, upper=200000)
    df['experience'] = df['experience'].clip(lower=0, upper=40)
    
    print(f"\n✓ Generated {n_rows} rows with {len(df.columns)} columns")
    print(f"✓ Columns: {', '.join(df.columns)}")
    
    # Introduce missing values with different patterns
    missing_config = {
        'age': 0.15,           # 15% missing
        'salary': 0.20,        # 20% missing
        'experience': 0.10,    # 10% missing
        'department': 0.25,    # 25% missing
        'city': 0.30,          # 30% missing
        'performance_score': 0.60,  # 60% missing (should be dropped)
        'education': 0.12      # 12% missing
    }
    
    print("\n" + "=" * 60)
    print("INTRODUCING MISSING VALUES")
    print("=" * 60)
    
    for column, percentage in missing_config.items():
        n_missing = int(n_rows * percentage)
        missing_indices = np.random.choice(df.index, n_missing, replace=False)
        df.loc[missing_indices, column] = np.nan
        print(f"✓ {column:20s}: {percentage*100:5.1f}% missing ({n_missing} values)")
    
    # Save dataset
    df.to_csv(save_path, index=False)
    
    print("\n" + "=" * 60)
    print("DATASET SUMMARY")
    print("=" * 60)
    print(f"\nShape: {df.shape}")
    print(f"\nMissing values:\n{df.isnull().sum()}")
    print(f"\nTotal missing: {df.isnull().sum().sum()}")
    print(f"Data completeness: {(1 - df.isnull().sum().sum() / df.size) * 100:.2f}%")
    
    print(f"\n✓ Dataset saved to: {save_path}")
    print("=" * 60)
    
    return df

if __name__ == "__main__":
    # Create sample dataset
    df = create_sample_dataset(n_rows=1000, save_path='dataset.csv')
    
    # Display first few rows
    print("\nFirst 10 rows:")
    print(df.head(10))
